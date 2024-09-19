import { booksInDateRange1, booksInDateRange2, booksInDateRange3, bookUsersDetail, getBook, issueBook, returnBook, totalBookRent } from '../controllers/bookController';
import isAuthenticated from '../middleware/isAuthenticated';
// import {bookUsersDetail, createBook, getBook, issueBook, returnBook, totalBookRent, totalRent } from '../controllers/bookController';
import express from 'express'

const router = express.Router();

router.get('/get',isAuthenticated, getBook);
router.post('/issue',isAuthenticated,issueBook);
router.post('/return',isAuthenticated, returnBook);
router.get('/issued/users',isAuthenticated,bookUsersDetail)
router.get('/total-book-rent',isAuthenticated, totalBookRent);
router.get('/daterange1', booksInDateRange1);
router.get('/daterange2', booksInDateRange2);
router.get('/daterange3',booksInDateRange3)


export default router;