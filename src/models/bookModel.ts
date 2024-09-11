import mongoose from "mongoose";

const Books_DB = mongoose.connection.useDb("lib_DB");

interface Book {
  bookName: string;
  authorName: string;
  category: string;
  rentPricePerDay: number;
}
const bookSchema = new mongoose.Schema<Book>({
  bookName: { type: String, required: true },
  authorName: { type: String, required: true },
  category: { type: String, required: true },
  rentPricePerDay: { type: Number, required: true },
});

export const Book = Books_DB.model<Book>("Book", bookSchema);
