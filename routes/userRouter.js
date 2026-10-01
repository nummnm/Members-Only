const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const profileController = require('../controllers/profileController');
const { uploadProfileIcon } = require('../middleware/profileUpload');

const { ensureAuthenticated } = require('../middleware/authMiddleware');

router.get('/join-club', ensureAuthenticated, userController.getJoinClub);
router.post('/join-club', ensureAuthenticated, userController.postJoinClub);
router.get('/join-admin', ensureAuthenticated, userController.getJoinAdmin);
router.post('/join-admin', ensureAuthenticated, userController.postJoinAdmin);
router.get('/profile', ensureAuthenticated, profileController.getProfile);
router.post(
	'/profile/avatar',
	ensureAuthenticated,
	(req, res, next) => uploadProfileIcon.single('profileIcon')(req, res, (error) => {
		if (!error) return next();
		const message = error.code === 'LIMIT_FILE_SIZE'
			? 'Choose an image that is 2 MB or smaller.'
			: 'Choose a PNG, JPEG, or WebP image.';
		return res.status(400).render('profile', {
			user: req.user,
			error: message,
			message: null,
		});
	}),
	profileController.postProfileIcon
);
router.post('/profile/avatar/remove', ensureAuthenticated, profileController.postRemoveProfileIcon);
router.post('/profile/leave-club', ensureAuthenticated, profileController.postLeaveClub);
router.post('/profile/remove-admin', ensureAuthenticated, profileController.postRemoveAdmin);
router.post('/profile/delete', ensureAuthenticated, profileController.postDeleteAccount);

module.exports = router;
