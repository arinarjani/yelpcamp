const router = require('express').Router();
const Campground = require('../models/campgrounds');
const { isLoggedIn, checkCampgroundOwnership } = require('../middleware');

// INDEX - show all campgrounds
router.get('/', (req, res) => {
    // GET all campgrounds from the database
    Campground.find((err, campgrounds) => {
        if (err) {
            console.log(err);
        } else {
            // render the db campgrounds
            res.render('campgrounds/index', {campgrounds});
        }
    })
});

// CREATE - add new campground to db
router.post('/', isLoggedIn, (req, res) => {
    // get data from form and add to Campgrounds DB using the Campground Model
    const {name, image, description, price} = req.body;
    const author = {
        id: req.user._id,
        username: req.user.username
    };
    const newCampground = {name, image, description, author, price};
    Campground.create(newCampground, (err, campground) => {
        if (err) {
            req.flash('error', 'something went wrong');
            console.log(err);
        } else {
            // display what was created
            console.log('./routes/campground:31 - created', campground);
            req.flash('success', 'campground created');
            // redirect to /campground route
            res.redirect('/campgrounds');
        }
    });
});

// NEW - show form to create new campground
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});

// SHOW - shows more info about one campground
router.get('/:id', (req,res) => {
    const id = req.params.id;
    Campground.findById(id).populate('comments').exec((err, campground) => {
        if (err || !campground) {
            console.log(err);
            req.flash('error', 'campground not found');
            res.redirect('/campgrounds');
        } else {
            console.log('./routes/campground.js:50 - campground', campground)
            res.render('campgrounds/show', {campground});
        }
    });
});

// edit campground route
router.get('/:id/edit', checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        res.render('campgrounds/edit', {campground});
    });
});

// update campground route
router.put('/:id', checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndUpdate(req.params.id, req.body, (err, campground) => {
        // show error or redirect to the campground show page
        if (err) {
            res.redirect(`/campgrounds/${req.params.id}/edit`);
        } else {
            res.redirect(`/campgrounds/${req.params.id}`);
        }
    });
});

// destroy campground route
router.delete('/:id', checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndDelete(req.params.id, (err) => {
        if (err) {
            // if err, redirect to req.params.id campground
            console.log(err);
            res.redirect(`/campgrounds/${req.params.id}`);
        } else {
            // else delete the campground and redirect to the show all campgrounds page
            res.redirect('/campgrounds');
        }
    });
});

module.exports = router;