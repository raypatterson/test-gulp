#!/bin/sh
echo '.'
echo '.'
echo '.'
echo '. . . Welcome'
echo '.'
echo '.'
echo '.'
echo '. . . Installing'
echo '.'
echo '.'
echo '.'
gem install bundler
bundle install
npm install -g --loglevel silent gulp bower
npm install --save-dev --loglevel silent gulp gulp-util
npm install --loglevel silent
bower install --silent
echo '.'
echo '.'
echo '.'
echo '. . . Complete'
echo '.'
echo '.'
echo '.'
echo '. . . Starting'
echo '.'
echo '.'
echo '.'
gulp