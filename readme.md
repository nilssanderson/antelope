# Antelope #

> Starter webapp framework created using the [Yeoman](http://yeoman.io) generator that scaffolds out a front-end web app using [Gulp](http://gulpjs.com/) for the build process, [Foundation 6](http://foundation.zurb.com/sites) for the SCSS framework, [BackstopJS](https://garris.github.io/BackstopJS) for the automatic regression tests and [SC5 Style guide generator](http://styleguide.sc5.io/) for creating a living Styleguide.


### What is this repository for? ###

Starting development on a new project or adding to an existing project? Install now to have a framework with automation.


### What does this repository do? ###

* Built upon Foundation 6 from Zurb - http://foundation.zurb.com/sites/docs/
* Automating CSS Regression Testing - phantomjs, casperjs and backstopjs
* Automatic Styleguide creation - SC5 styleguide using KSS notation

(Use this link for referencing classes and how to construct HTML pages using the correct classes)


### Getting Started ###

To get started download Antelope with Git:
```
git clone https://github.com/nilssanderson/antelope.git
cd antelope
npm install
bower install
```

Then to build the framework:
```
gulp
```

The default task should:

* Build out a static app
* Convert SCSS to CSS
* Generate a SC5 Styleguide based on the SCSS comments
* Present a UI Elements page
* Open these in the browser for viewing and updating (Styleguide)

Your finished site will be created in a folder called `dist`, viewable at this URL:

```
http://localhost:8000
```

To create compressed, production-ready assets, run `gulp build`.


### Setting up the Automatic CSS Regression Testing ###

Follow the below instructions to set up the BackstopJS tests and update the backstop.json file as needed if one does not exist.
Open the folder in your command line, and install the needed dependencies:
```
cd bower/BackstopJS
npm install
sudo npm install -g phantomjs
sudo npm install -g casperjs
cd ../../
```

Run this after any change to the backstop.json file to update the references:
```
gulp update-tests
```

Then to run the tests:
```
gulp run-tests
```
