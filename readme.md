# [Antelope](https://github.com/nilssanderson/antelope) #

> Starter webapp framework created using the [Yeoman](http://yeoman.io) generator that scaffolds out a front-end web app using [Gulp](http://gulpjs.com/) for the build process, [Foundation 6](http://foundation.zurb.com/sites) for the SCSS framework, [BackstopJS](https://garris.github.io/BackstopJS) for the automatic regression tests and [SC5 Style guide generator](http://styleguide.sc5.io/) for creating a living Styleguide.


### What is this repository for? ###

Starting development on a new project or adding to an existing project? Install now to have a framework with automation.


### What does this repository do? ###

* Built upon Foundation 6 from Zurb - http://foundation.zurb.com/sites/docs/
* Automating CSS Regression Testing - phantomjs, casperjs and backstopjs
* Automatic Styleguide creation - SC5 styleguide using KSS notation

(Use this link for referencing classes and how to construct HTML pages using the correct classes)


# Getting Started #

To get started download [Antelope](https://github.com/nilssanderson/antelope) with Git:
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

Your finished site will be created in a folder called `build`, viewable at this URL:

```
http://localhost:8000
```

To create compressed, production-ready assets, run:
```
gulp build
```


# Setting up the Automatic CSS Regression Testing #

Follow the below instructions to set up the BackstopJS tests and update the `backstop.json` file as needed if one does not exist.
Open the folder in your command line, and install the needed dependencies:
```
cd bower/BackstopJS
npm install
sudo npm install -g phantomjs
sudo npm install -g casperjs
cd ../../
```

Run this after any change to the `backstop.json` file to update the references:
```
gulp update-tests
```

Then to run the tests:
```
gulp run-tests
```

# Adding the framework as a submodule #

Follow the below instructions to add the framework to an already existing project and to keep it separate from your current repository:
```
git submodule add https://github.com/nilssanderson/antelope.git antelope
git submodule init
git submodule update
```

Once the framework has been added in as a submodule, a `.gitmodules` file will be created. You will need to specify the branch that you wish to track on the framework. Edit the `.gitmodules` file to include the branch:
```
[submodule "antelope"]
	path = antelope
	url = https://github.com/nilssanderson/antelope.git
	branch = master
```

Run this if there have been any updates to the [Antelope](https://github.com/nilssanderson/antelope) framework to pull down the latest changes:
```
git submodule update
```
