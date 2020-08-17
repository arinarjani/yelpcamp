// ADD {mergeParams: true} TO ALLOW THE KEEPING OF :id in app.js
const router = require('express').Router({mergeParams: true});
const Comment = require('../models/comment');
const Campground = require('../models/campgrounds');
const { isLoggedIn, checkCommentOwnerShip } = require('../middleware');

// route to get new comment form
router.get('/new', isLoggedIn, (req, res) => {
    const id = req.params.id;
    Campground.findById(id, (err, campground) => {
        if (err || !campground) {
            console.log(err);
            req.flash('error', 'campground not found');
            res.redirect('/campgrounds');
        } else {
            res.render('comments/new', {campground: campground});
        }
    });
});

// route to submit the new comment to the database
router.post('/', isLoggedIn, (req, res) => {
    //  look up camground using id
    const id = req.params.id;
    Campground.findById(id, (err, campground) => {
        if (err) {
            console.log(err);
            res.redirect('/campgrounds');
        } else {
            // create new comment
            Comment.create(req.body.comment, (err, comment) => {
                if (err) {
                    req.flash('error', 'something went wrong');
                    console.log(err);
                } else {
                    // add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    // save comment
                    comment.save();
                    // connect new comment to campground
                    campground.comments.push(comment);
                    campground.save();
                    req.flash('success', 'comment created');
                    // redirect to show page
                    res.redirect(`/campgrounds/${id}`);
                }
            })
        }
    });
});

// edit comment route
router.get('/:comment_id/edit', checkCommentOwnerShip , (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        if (err || !campground) {
            console.log(err);
            req.flash('error', 'campground not found');
            res.redirect('/campgrounds');
        } else {
            Comment.findById(req.params.comment_id, (err, comment) => {
                if (err) {
                    console.log(err);
                    res.redirect('back');
                } else {
                    // show comment edit form with Comment and Campground._id
                    res.render('comments/edit', {comment, campground: {_id: req.params.id}});
                }
            });
        }
    });
    // Comment.findById(req.params.comment_id, (err, comment) => {
    //     if (err) {
    //         console.log(err);
    //         res.redirect('back');
    //     } else {
    //         // show comment edit form with Comment and Campground._id
    //         res.render('comments/edit', {comment, campground: {_id: req.params.id}});
    //     }
    // });
});

// update comment route
router.put('/:comment_id', checkCommentOwnerShip, (req, res) => {
    //find specific comment to update
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, comment) => {
        if (err) {
            // redirect back
            console.log(err);
            res.redirect('back');
        } else {
            // redirect back to the show page for the campground
            res.redirect(`/campgrounds/${req.params.id}`);
        }
    });
});

// destroy comment route
router.delete('/:comment_id', checkCommentOwnerShip, (req, res) => {
    // find comment to delete
    Comment.findByIdAndDelete(req.params.comment_id, (err) => {
        if (err) {
            // redirect back
            console.log(err);
            res.redirect('back');
        } else {
            // redirect to show route for a campground
            req.flash('success', 'comment deleted');
            res.redirect(`/campgrounds/${req.params.id}`);
        }
    });
});

module.exports = router;