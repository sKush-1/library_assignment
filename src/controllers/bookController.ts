import { Request, Response } from "express";
import { Book } from "../models/bookModel";
import { FilterQuery } from "mongoose";
import { z } from "zod";
import { BookTransaction } from "../models/bookTransactionModel";
import { User } from "../models/userModel";

interface book {
  bookName: string;
  authorName: string;
  category: string;
  rentPricePerDay: number;
}

export const getBook = async (req: Request, res: Response) => {
  const { search, minPrice, maxPrice } = req.query;

  const query: FilterQuery<book> = {};

  if (search) {
    query.$or = [
      { bookName: { $regex: search, $options: "i" } },
      { authorName: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ];
  }

  if (minPrice || maxPrice) {
    query.rentPricePerDay = {};
    if (minPrice) query.rentPricePerDay.$gte = Number(minPrice);
    if (maxPrice) query.rentPricePerDay.$lte = Number(maxPrice);
  }

  try {
    const books = await Book.find(query);
    res.status(200).json({
      success: true,
      books,
      count: books.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch books",
      error,
    });
  }
};

export const issueBook = async (req: Request, res: Response) => {
  try {
    const { user, bookName } = req.body;

    const transactionSchema = z.object({
      user: z.string(),
      bookName: z.string(),
    });

    transactionSchema.parse(req.body);

    const book = await Book.findOne({ bookName });

    if (!book) {
      return res.status(401).json({
        message: "No such book exists",
      });
    }

    const alreadyIssued = await BookTransaction.findOne({
      userId: user,
      bookName,
    });

    if (alreadyIssued) {
      return res.status(401).json({
        message: "Book already issued",
      });
    }

    const issuedBy = await User.findById(user);

    const bookTransaction = await BookTransaction.create({
      userId: user,
      username: issuedBy.username,
      bookName,
      issuedDate: new Date().toISOString(),
    });

    return res.status(201).json({
      message: "Book issued",
      transactionId: bookTransaction._id,
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      message: "Failed to issue book",
      error,
    });
  }
};

export const returnBook = async (req: Request, res: Response) => {
  try {
    const { user, bookName } = req.body;

    const transactionSchema = z.object({
      user: z.string(),
      bookName: z.string(),
    });

    transactionSchema.parse(req.body);

    const bookDetails = await BookTransaction.findOne({
      userId: user,
      bookName,
    });

    if (!bookDetails) {
      return res.status(401).json({
        message: "No such book is issued to this user.",
      });
    }

    if (bookDetails.status === "returned") {
      return res.status(401).json({
        message: "Book already returned",
      });
    }

    const book = await Book.findOne({ bookName });

    const date1 = new Date();
    const date2 = new Date(bookDetails.issuedDate);
    const diff = Math.abs(date1.getTime() - date2.getTime());
    const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
    const totalRent = diffDays * book.rentPricePerDay;

    bookDetails.status = "returned";
    bookDetails.returnedDate = `${new Date().toISOString()}`;
    bookDetails.totalRentPaid = totalRent;

    const updatedBookDetails = await bookDetails.save();

    return res.status(201).json({
      message: "Book returned",
      updatedBookDetails,
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      message: "Failed to return book",
      error,
    });
  }
};

export const bookUsersDetail = async (req: Request, res: Response) => {
  try {
    const { bookName } = req.body;
    const { userId, startDate, endDate } = req.query;

    let query: { bookName?: string; userId?: string; issuedDate?: any } = {};

    if (bookName) query.bookName = bookName;
    if (userId) query.userId = userId as string;

    if (startDate || endDate) {
      query.issuedDate = {};
      if (startDate)
        query.issuedDate.$gte = new Date(startDate as string).toISOString();
      if (endDate)
        query.issuedDate.$lte = new Date(endDate as string).toISOString();
    }

    const bookTransactions = await BookTransaction.find(query);

    const transactionDetails = bookTransactions.map((bookTransaction) => ({
      username: bookTransaction.username,
      status: bookTransaction.status,
      issuedDate: bookTransaction.issuedDate,
    }));

    const size = transactionDetails.length;

    return res.status(200).json({
      transactionDetails,
      size,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch book users",
      error: error.message,
    });
  }
};

export const totalBookRent = async (req: Request, res: Response) => {
  const { bookName } = req.body;

  const bookSchema = z.object({
    bookName: z.string(),
  });

  bookSchema.parse(req.body);

  const bookTransactions = await BookTransaction.find({ bookName });

  let totalRentGenerated = 0;

  const transactionDetails = bookTransactions.map((bookTransaction) => {
    if (bookTransaction.totalRentPaid) {
      totalRentGenerated += bookTransaction?.totalRentPaid;
    }
  });

  return res.status(201).json({
    totalRentGenerated,
  });
};

export const booksInDateRange1 = async (req: Request, res: Response) => {
  // books issued and returned within date range mongodb aggregation pipeline

  try {
    const { startDate, endDate } = req.query;

    const start = new Date(startDate as string).toISOString();

    const end = new Date(endDate as string).toISOString();
    const bookTransaction = await BookTransaction.aggregate([
      {
        $match: {
          $and: [
            {
              issuedDate: {
                $gte: start,
                $lte: end,
              },
            },
            {
              returnedDate: {
                $gte: start,
                $lte: end,
              },
            },
          ],
        },
      },
    ]);

    return res.status(200).json({
      bookTransaction,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error fetching books in date range",
      error,
    });
  }
};

export const booksInDateRange2 = async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  const start = new Date(startDate as string);

  const end = new Date(endDate as string);

  try {
    const allBookTransactions = await BookTransaction.find();

    const filteredTransactions = allBookTransactions.filter((transaction) => {
      const issuedDate = new Date(transaction.issuedDate);
      const returnedDate = new Date(transaction.returnedDate);

      return (
        issuedDate >= start &&
        issuedDate <= end &&
        returnedDate >= start &&
        returnedDate <= end
      );
    });

    return res.status(200).json({
      bookTransaction: filteredTransactions,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error getting books in date range",
      error,
    });
  }
};

export const booksInDateRange3 = async (req: Request, res: Response) => {
  // books issued and returned in a date range using gte and lte operator
  try {
    const { userId, startDate, endDate } = req.query;

    let query: {
      userId?: string;
      issuedDate?: any;
      returnedDate?: any;
    } = {};

    if (startDate || endDate) {
      query.issuedDate = {};
      query.returnedDate = {};

      if (startDate) {
        query.issuedDate.$gte = new Date(startDate as string).toISOString();
        query.returnedDate.$gte = new Date(startDate as string).toISOString();
      }

      if (endDate) {
        query.issuedDate.$lte = new Date(endDate as string).toISOString();
        query.returnedDate.$lte = new Date(endDate as string).toISOString();
      }
    }

    const bookTransaction = await BookTransaction.find(query);
    return res.status(201).json({
      bookTransaction,
    });
  } catch (error) {
    console.log(error);
    res.status(201).json({
      message: "Error fetching books",
      error,
    });
  }
};
