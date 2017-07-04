'use strict';

const $ = require('jquery');

/**
 * Class representing a SlideMotion
 * @author Phil
 * @since 2017.05.31
 * @since 2017.06.20 - add pagination
 */
class SlideMotion {
  /**
   * Create a SlideMotion
   * @param {string|Object} slideElement selector.
   * @param {Object} [options] slide option.
   */
  constructor(slideElement, options) {
    /**
     * - Basic -
     * selectedIndex: 현재 선택된 인덱스.
     * hoverIndex: 현재 롤오버된 인덱스.
     * timer: 타이머수치.
     * $sliderWrapper: 슬라이더를 감싸는 div.
     * $slideContainer: 슬라이더 리스트 컨테이너.
     * $slideList: 슬라이드 리스트.
     * slideTotalLength: 슬라이드 총 갯수.
     * $bigImageContainer: GALLERY모드에서 큰 이미지 영역.
     * $arrow: 화살표
     * $pagination: 슬라이드 페이지네이션 컨테이너.
     * $page: 각 페이지네이션.
     */
    this.$slideElement = $(slideElement);
    this.selectedIndex = 0;
    this.hoverIndex = 0;
    this.timer = 0;
    this.$sliderWrapper = this.$slideElement.find('[data-slide=wrapper]');
    this.$slideContainer = this.$slideElement.find('[data-slide=list]');
    this.$slideList = this.$slideContainer.children();
    this.slideTotalLength = this.$slideList.length;
    this.$bigImageContainer = this.$slideElement.find('[data-slide=bigImage]');
    this.$arrow = this.$slideElement.find('[data-slide-arrow]');
    this.$pagination = this.$slideElement.find('[data-slide=pagination]');
    this.$page = this.$slideElement.find('[data-slide=page]');

    /**
     * options detail
     * @property {number} sliderWidth - 슬라이드 넓이(마진포함)
     * @property {number} sliderMargin - 슬라이드 마진
     * @property {number} initialDisplayCount - 슬라이드 컨테이너가 보여주는 최대 갯수
     * @property {number} viewCount - 슬라이드 이동 및 전시 갯수
     * @property {string} effectType - 슬라이드 효과 ('FADE','SLIDE','GALLERY')
     * @property {number|string} fadeSpeed - 페이드시 스피드
     * @property {number|string} slideSpeed - 슬라이드 스피드
     * @property {number} setTime - 슬라이드 변경 시간
     * @property {boolean} autoPlay - 자동재생 여부
     * @property {boolean} playofout - 롤오버 포커스아웃 여부에 따라 재생여부
     * @property {string} listHoverClass - 슬라이드 리스트 롤오버 Class
     * @property {string} arrowHoverClass - 슬라이드 화살표 롤오버 Class
     * @property {boolean} pagination - 슬라이드 페이지네이션 노출 여부
     * @property {string} paginationClass - 슬라이드 페이지 네이션 액티브 Class
     */
    this.options = {
      sliderWidth: this.$slideList.outerWidth(true),
      sliderMargin: 0,
      initialDisplayCount: 4,
      viewCount: 1,
      effectType: 'SLIDE',
      fadeSpeed: 500,
      slideSpeed: 500,
      setTime: 3000,
      autoPlay: false,
      playofout: false,
      listHoverClass: 'on',
      arrowHoverClass: 'on',
      pagination: false,
      paginationClass: 'on',
    };
    this.options = $.extend({}, this.options, options || {});
    this.displaySlideCount = Math.ceil(this.slideTotalLength / this.options.viewCount);
    this.autoFlag = this.slideTotalLength > this.options.viewCount ? true : false;
  }

  init() {
    this.$slideList.each(function (idx) {
      $(this).attr('data-slide-index', idx);
    });
    this.userControl();
    this.initialDisplay();

    if (this.autoFlag && this.options.autoPlay) {
      this.sliderPlay();
    }

    const isPagination = (this.$pagination.length > 1 ) ? true : false;
    if (isPagination && this.options.pagination) {
      this.setPagination();
      this.$pagination.css('display', 'block');
    }
  }

  initialFadeDisplay() {
    this.$slideContainer.css('overflow', 'initial');
    const $slideList = this.$slideList;
    const viewCount = this.options.viewCount;
    const style = {
      position: 'absolute',
      float: 'none',
      top: '0px',
      opacity: 0,
      zIndex: 98,
    };
    $slideList.css(style);
    let j = 0;
    for (let i = 0; i < this.slideTotalLength; i++) {
      $slideList.eq(i).css('left', j * this.options.sliderWidth + 'px');
      j = (j < viewCount - 1) ? j + 1 : 0;
    }
    for (let i = 0; i < viewCount; i++) {
      $slideList.eq(i).css('opacity', 1).attr('data-slide-fade', 'play');
    }
  }

  initialSlideStyle() {
    const style = {
      width: '99999px',
      overflow: 'hidden',
      position: 'relative',
    };
    this.$slideContainer.css(style);
  }

  initialSlideDisplay() {
    const $slideList = this.$slideList;
    for (let i = 0; i < this.options.initialDisplayCount; ++i) {
      $slideList.eq(i).clone(true).appendTo(this.$slideContainer);
      $slideList.eq((this.slideTotalLength - 1) - i).clone(true).prependTo(this.$slideContainer);
    }
    this.setSlidePosition();
  }

  initialDisplay() {
    let containerWidth = 0;
    const slideMarginRight = parseInt(this.$slideList.css('margin-right'));

    for (let i = 0; i < this.options.initialDisplayCount; ++i) {
      containerWidth += this.$slideList.eq(i).outerWidth(true);
    }

    this.$slideContainer.parent().css('width', (containerWidth - slideMarginRight) + 'px');
    if (this.slideTotalLength > this.options.initialDisplayCount) {
      this.$arrow.css('display', 'block');
    }

    switch (this.options.effectType) {
      case 'FADE':
        this.initialFadeDisplay();
        break;
      case 'GALLERY':
        this.initialSlideStyle();
        if (this.slideTotalLength > this.options.initialDisplayCount) {
          this.initialSlideDisplay();
        }
        this.initialBigImageDisplay();
        this.hoverSlide();
        break;
      case 'SLIDE':
      default:
        this.initialSlideStyle();
        if (this.slideTotalLength > this.options.initialDisplayCount) {
          this.initialSlideDisplay();
        }
        break;
    }
  }

  initialBigImageDisplay() {
    const $bigImage = this.$bigImageContainer.children();
    const $slideContainer = this.$slideContainer;

    $bigImage.each(function (index) {
      $(this).attr('data-slide-index', index).css('display', 'none');
    });
    $slideContainer.find('[data-slide-index]').removeClass(this.options.listHoverClass);
    $slideContainer.find('[data-slide-index=' + this.hoverIndex + ']').addClass(this.options.listHoverClass);
    $bigImage.eq(this.hoverIndex).css('display', 'block');
  }

  hoverSlide() {
    const $thumbImg = this.$slideContainer.find('[data-slide-index=' + this.hoverIndex + ']');
    this.$slideContainer.find('[data-slide-index]').css('opacity', '0.5').removeClass(this.options.listHoverClass);
    $thumbImg.css('opacity', '1').addClass(this.options.listHoverClass);
  }

  setSlidePosition() {
    this.$slideContainer.css('left', -((this.options.sliderWidth + this.options.sliderMargin) * (this.options.initialDisplayCount + this.selectedIndex)) + 'px');
  }

  nextControl() {

    switch (this.options.effectType) {
      case 'FADE':
        this.selectedIndex = (this.selectedIndex === this.displaySlideCount - 1) ? 0 : this.selectedIndex + 1;
        this.effectFade();
        break;
      case 'GALLERY':
        this.hoverIndex = (this.hoverIndex === this.displaySlideCount - 1) ? 0 : this.hoverIndex + 1;
        if (this.slideTotalLength > this.options.initialDisplayCount) {
          this.selectedIndex++;
          this.effectSlide('NEXT');
        } else {
          this.initialBigImageDisplay();
          this.hoverSlide();
        }
        break;
      case 'SLIDE':
        if (this.selectedIndex < this.displaySlideCount) {
          this.selectedIndex++;
        }
        this.effectSlide('NEXT');
        break;
      default:
        break;
    }
  }

  prevControl() {

    switch (this.options.effectType) {
      case 'FADE':
        this.selectedIndex = (this.selectedIndex === 0) ? this.displaySlideCount - 1 : this.selectedIndex - 1;
        this.effectFade();
        break;
      case 'GALLERY':
        this.hoverIndex = (this.hoverIndex > 0 ) ? this.hoverIndex - 1 : this.displaySlideCount - 1;
        if (this.slideTotalLength > this.options.initialDisplayCount) {
          this.selectedIndex--;
          this.effectSlide('PREV');
        } else {
          this.initialBigImageDisplay();
          this.hoverSlide();
        }
        break;
      case 'SLIDE':
        if (this.selectedIndex >= 0 ) {
          this.selectedIndex--;
        }
        this.effectSlide('PREV');
        break;
      default:
        break;
    }
  }

  effectFade() {
    let fadeInIdx;
    const $fadeOut = $('[data-slide-fade=play]');
    const startIdx = this.selectedIndex * this.options.viewCount;

    for (let i = 0; i < this.options.viewCount; ++i) {
      fadeInIdx = startIdx + i;
      this.$slideList.eq(fadeInIdx).fadeTo(this.options.fadeSpeed, 1).attr('data-slide-fade', 'play').css('zIndex', '99');
    }
    $fadeOut.fadeTo(this.options.fadeSpeed, 0).removeAttr('data-slide-fade').css('zIndex', '98');

    if (this.options.pagination) {
      this.setPagination();
    }
  }

  /**
   * effectSlide
   * @param {string} direction direction. 'PREV', 'NEXT'
   */
  effectSlide(direction) {

    const $slideContainer = this.$slideContainer;
    const isPlay = $slideContainer.attr('isplay');
    const sliderWidth = this.options.sliderWidth;
    const sliderMargin = this.options.sliderMargin;

    if (!isPlay) {
      $slideContainer.attr('isPlay', 'PLAY').stop().animate({
        left: -((sliderWidth + sliderMargin) * this.options.initialDisplayCount) - (this.options.viewCount * this.selectedIndex * (sliderWidth + sliderMargin)) }, this.options.slideSpeed, 'swing', () => {
          if (direction === 'PREV') {
            if (this.selectedIndex < 0) {
              this.selectedIndex = this.slideTotalLength - this.options.viewCount;
              this.setSlidePosition();
              this.selectedIndex = this.displaySlideCount - 1;
            }
          } else {
            if (this.selectedIndex === this.displaySlideCount ) {
              this.selectedIndex = 0;
              this.setSlidePosition();
            }
          }
          if (this.options.effectType === 'GALLERY') {
            this.initialBigImageDisplay();
            this.hoverSlide();
          }
          if (this.options.pagination) {
            this.setPagination();
          }
          $slideContainer.removeAttr('isplay');
        });
    }
  }

  sliderStop() {
    clearInterval(this.timer);
  }

  sliderPlay() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.nextControl();
    }, this.options.setTime);
  }

  setPagination() {
    this.$page.removeClass(this.options.paginationClass).eq(this.selectedIndex).addClass(this.options.paginationClass);
  }

  userControl() {

    const self = this;
    const playofout = this.options.playofout;
    const autoFlag = this.autoFlag;

    /**
     * Slide Next Prev Button Click/hover/focus
     */
    this.$arrow.on({
      click() {
        const isPlay = self.$slideContainer.attr('isPlay');
        const direction = $(this).attr('data-slide-arrow');

        self.sliderStop();
        if (!isPlay) {
          if (direction === 'NEXT') {
            self.nextControl();
          } else {
            self.prevControl();
          }
        } else {
          return false;
        }
        return false;
      },
      mouseenter() {
        $(this).addClass(self.options.arrowHoverClass);
        self.sliderStop();
      },
      mouseleave() {
        $(this).removeClass(self.options.arrowHoverClass);
        if (autoFlag && playofout) {
          self.sliderPlay();
        }
      },
      focusin() {
        self.sliderStop();
      },
      focusout() {
        self.sliderStop();
        if (autoFlag && playofout) {
          self.sliderPlay();
        }
      },
    });

    /**
     * Slide hover/focus
     */
    this.$slideList.on({
      click() {
        self.sliderStop();
      },
      mouseenter() {
        self.sliderStop();
        if (self.options.effectType === 'GALLERY') {
          const $index = parseInt($(this).attr('data-slide-index'));
          self.hoverIndex = $index;
          self.hoverSlide();
          self.initialBigImageDisplay();
        }
      },
      mouseleave() {
        if (autoFlag && playofout) {
          self.sliderPlay();
        }
      },
      focusin() {
        self.sliderStop();
      },
      focusout() {
        self.sliderStop();
        if (autoFlag && playofout) {
          self.sliderPlay();
        }
      },
    });

    /**
     * page hover/focus
     */
    this.$page.on({
      click() {
        const $index = parseInt($(this).index() + 1);
        self.sliderStop();
        self.selectedIndex = (self.selectedIndex > this.displaySlideCount) ? 0 : $index;
        if ($index < self.selectedIndex) {
          self.nextControl();
        } else {
          self.prevControl();
        }
      },
      mouseenter() {
        self.sliderStop();
      },
      mouseleave() {
        if (autoFlag && playofout) {
          self.sliderPlay();
        }
      },
      focusin() {
        self.sliderStop();
      },
      focusout() {
        self.sliderStop();
        if (autoFlag && playofout) {
          self.sliderPlay();
        }
      },
    });
  }
}

module.exports = SlideMotion;
