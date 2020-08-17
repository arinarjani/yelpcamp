const Comment = require('../models/comment');
const Campground = require('../models/campgrounds');

const middlewareObj = {};

middlewareObj.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error', 'you need to be logged in to do that');
    res.redirect('/login');
}

middlewareObj.checkCampgroundOwnership = (req, res, next) => {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, (err, campground) => {
            if (err || !campground) {
                console.log(err);
                req.flash('error', 'campground not found');
                res.redirect('back');
            } else {
                // does the user own the campground?
                if (campground.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash('error', 'you do not have permission to do that');
                    res.redirect('back');
                }
            }
        });
    } else {
        req.flash('error', 'you need to be logged in to do that');
        res.redirect('back');
    }
}

middlewareObj.checkCommentOwnerShip = (req, res, next) => {
    // check if logged in
    if (req.isAuthenticated()) {
        // find comment they clicked on
        Comment.findById(req.params.comment_id, (err, comment) => {
            if (err || !comment) {
                console.log(err);
                req.flash('error', 'comment not found');
                res.redirect('back');
            } else {
                // check if they own the comment
                if (comment.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash('error', 'you do not have permission to do that');
                    res.redirect('back');
                }
            }
        });
    } else {
        req.flash('error', 'you need to login to do that');
        // redirect back (aka current page)
        res.redirect('back');
    }
}

module.exports = middlewareObj;