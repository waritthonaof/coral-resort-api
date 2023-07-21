const express = require('express');

const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  getMe,
} = require('../controllers/userController');

const { protect, rolePermission } = require('../middleware/authGuard');
const {
  resizeUserImage,
  fileUpload,
  destination,
} = require('../middleware/fileUpload');

const router = express.Router();

router.use(protect);

router.get('/me', getMe, getUser);
router.patch(
  '/update-me',
  fileUpload.single('image'),
  destination('users'),
  resizeUserImage,
  updateMe
);

router.use(rolePermission('admin'));

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
