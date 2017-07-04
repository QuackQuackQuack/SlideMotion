'use strict';

require('./css/common.css');
require('./css/style.css');

const SlideMotion = require('./js/SlideMotion');


const slider1 = new SlideMotion('[data-container=slider1]', {
  initialDisplayCount: 1,
  viewCount: 1,
  effectType: 'SLIDE',
  pagination: true,
  playofout: true,
  autoPlay: true,
});

const slider2 = new SlideMotion('[data-container=slider2]', {
  initialDisplayCount: 2,
  viewCount: 2,
  effectType: 'FADE',
  playofout: false,
  autoPlay: false,
});

const slider3 = new SlideMotion('[data-container=slider3]', {
  initialDisplayCount: 3,
  viewCount: 1,
  effectType: 'GALLERY',
  playofout: false,
  autoPlay: false,
});

hljs.initHighlightingOnLoad();
slider1.init();
slider2.init();
slider3.init();
