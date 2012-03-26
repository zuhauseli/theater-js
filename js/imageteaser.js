(function($) {

	function findFirstImage(element) {
		var element = $(element);
		elements = element.find('.innerContent');
		var imagesBig = element.find('.imagesBig');
		var imagesSmall = element.find('.picturesSmall .listPictures');		
		
		//hide all big picture panels excpet the first in bigPictures
		var notFirstCategory = element.find('.imagePanel').not(':first');
		$.each(notFirstCategory, function(index) {
			var notFirstCategoryTitle = $(this).attr('data-category');
			var notFirstElement = element.find('.innerContent').filter('[data-category=' + notFirstCategoryTitle + ']');
			notFirstElement.hide();
		});
		//set correct width to the first element
		var firstCategory = element.find('.innerContent:first');
		var firstCategoryTitle = firstCategory.attr('data-category');
		firstImageElement = element.find('.innerContent').filter('[data-category=' + firstCategoryTitle + ']');
		firstImageElement.addClass('active');
		var panelWidth = 0;
		$.each(firstImageElement, function(index, value) {
			panelWidth += $(this).width();
		});
		imagesBig.width(panelWidth);

		//set correct width to small images
		var imageSmallWidth = 0;
		var allSmallWidth = imagesSmall.find('.imagePanel');
		$.each(allSmallWidth, function(index, value) {
			imageSmallWidth += $(this).width();
		});
		imagesSmall.width(imageSmallWidth+(allSmallWidth.length*6));

		//find category pictures small, set active and overlays
		categoryPictures = element.find('.picturesSmall .imagePanel');
		var firstCategoryPicture = element.find('.picturesSmall .imagePanel:first');
		var inactiveCategoryPictures = element.find('.picturesSmall .imagePanel').not(':first');
		firstCategoryPicture.addClass('active');
		inactiveCategoryPictures.find('.overlay').show();
	}

	var THEATER = {
		defaults : {
			animationSpeed 		: 1000, 				// how fast animtions are
			animationEffect 	: 'easeInOutExpo', 		// set your animation effect / available effects: http://ralphwhitbeck.com/demos/jqueryui/effects/easing/
			timer 				: true, 				// true or false to have the timer
			advanceSpeed 		: 4000,					// if timer is enabled, time between transitions
			backgroundColor		: '#FFF',				// the background color of theater-js
			backgroundCategory	: '#000',				// the background of categories
			backgroundAnimation	: '#000'				// the background in animation by switching the category
			
		},
		
		timerHTML: '<div class="timer"><span class="pause"></span></div>',

		init : function(element, options) {
			//some elements
			var $imageSlides,
				imagesLoadedCount = 0;
			counter = 1; 
			mySelf = this;
			findFirstImage(element);
			this.$element = $(element);
			this.$elements = elements;
			this.$wrapper = this.$element.wrap(this.wrapperHTML);
			this.options = $.extend({}, this.defaults, options);
			this.$slides = firstImageElement;
			this.$htmlElements = this.$element.find('.picturesBig').children('div, img');
			this.$slidesBottom = categoryPictures;
			this.$panelTop = this.$wrapper.find('.switchPanelTop');
			this.$panelBottom = this.$wrapper.find('.switchPanelBottom');
			clickCount = 1;
			clickCountBottom = 1;
			switchTimes = (this.$slidesBottom.length - this.$slidesBottom.length % 4) / 4-1;
			restClick = this.$slidesBottom.length % 4;		
			this.stopTimer = $.proxy(this.stopTimer, this);
			this.startTimer = $.proxy(this.startTimer, this);
			this.clickTimer = $.proxy(this.clickTimer, this);

			//disable click event
			$('.inspirationPanel .slideControllers a').bind('click', function(e) {
				e.preventDefault();
			});
			//stop timer on mouseover
			this.$wrapper.mouseenter(function() {
				//mySelf.stopTimer();
			});
			//start timer on mouse leave
			this.$wrapper.mouseleave(function() {
				//mySelf.stopTimer();
				//mySelf.startTimer();
			});

			this.$element.bind('theater.right', function() {
				mySelf.shiftTop('right');
			});

			this.$element.bind('theater.left', function() {
				mySelf.shiftTop('left');
			});

			this.$element.bind('theater.showInfos', function() {
				mySelf.shiftTop('showInfos');
			});

			this.$element.bind('theater.hideInfos', function() {
				mySelf.shiftTop('hideInfos');
			});

			this.$element.bind('theater.rightBottom', function() {
				mySelf.shiftBottom('right');
			});

			this.$element.bind('theater.leftBottom', function() {
				mySelf.shiftBottom('left');
			});

			this.$element.bind('theater.start', function(event, index) {
				mySelf.startTimer();
			});

			this.$element.bind('theater.stop', function(event, index) {
				mySelf.stopTimer();
			});
			
			//bad IE
			if (!$.browser.msie) { 			
				//preload images
				$imageSlides = this.$htmlElements.find('img');
				this.$htmlElements.hide();
				if($imageSlides.length === 0) {
					this.loaded();
				} else {
					$imageSlides.bind('imageready', function() {
						imagesLoadedCount += 1;
						if(imagesLoadedCount === $imageSlides.length) {
							mySelf.loaded();
						}
					});
				}
			}else {
				this.loaded();
			}
		},
		loaded : function() {
			this.setupDirectionalNavTop();
			this.setupAdditionalInfo();
			this.setupDirectionalNavBottom();		
			this.$htmlElements.show();
			this.setPreInformations();
			if(this.options.timer) {
				this.setupTimer();
				this.startTimer();
			}
		},
		
		setPreInformations :function(){					
			//set background color
			$(document).find('#innerContainer').css({'background-color' : this.options.backgroundColor});
			//set background color of categories
			$(document).find('.overlay').css({'background-color' : this.options.backgroundCategory});
			
			//set background color of animation in category switch
			$(document).find('.switchPanelBottom, .switchPanelTop').css({'background-color' : this.options.backgroundAnimation});
			
		},
		
		
		setupTimer: function () {
			this.$timer = $(this.timerHTML);
			this.$wrapper.append(this.$timer);
			this.$pause = this.$timer.find('.pause');
			this.$timer.click(this.clickTimer);
	    
	    },
	       
		startTimer : function() {
			var mySelf = this;
			if(!this.options.timer) {
				this.timerRunning = false;
				if(this.options.timer) { 
					this.$pause.removeClass('active');
				}
				return false;
			} else {
				this.timerRunning = true;
				this.$pause.addClass('active');
				this.clock = setInterval(function() {
					mySelf.$element.trigger('theater.right');
				}, this.options.advanceSpeed);		
			}		
			

		},
	    
		stopTimer : function() {
			clearInterval(this.clock);
			this.timerRunning = false;
			if(this.options.timer) { 
				this.$pause.removeClass('active');
			}			
		},
		
		clickTimer: function () {
			if(!this.timerRunning) {
				mySelf.startTimer();
			} else { 
				mySelf.stopTimer();
		  }
		},
				
		setupDirectionalNavTop : function() {
			var mySelf = this;
			this.$wrapper.find('.picturesBig .slideControllers a.right').click(function() {
				mySelf.stopTimer();
				//allow click when not in animation
				if(!mySelf.$element.find('.innerContent').is(':animated')) {
					mySelf.$element.trigger('theater.right');
				}
			});

			this.$wrapper.find('.picturesBig .slideControllers a.left').click(function() {
				mySelf.stopTimer();
				//allow click when not in animation
				if(!mySelf.$element.find('.innerContent').is(':animated')) {
					mySelf.$element.trigger('theater.left');
				}
			});
		},
		setupAdditionalInfo : function() {
			this.$wrapper.find('.picturesBig .imagesBig .innerContent .additionalInfos').mouseenter(function() {
				mySelf.stopTimer();
				mySelf.$element.trigger('theater.showInfos');
			});

			this.$wrapper.find('.picturesBig .imagesBig .innerContent .additionalInfos').mouseleave(function() {
				mySelf.startTimer()
				mySelf.$element.trigger('theater.hideInfos');
			});
		},
		setupDirectionalNavBottom : function() {
			this.$wrapper.find('.picturesSmall .slideControllers a.right').click(function() {
				mySelf.stopTimer();				
				if(!mySelf.$element.find('.picturesSmall .listPictures .imagePanel').is(':animated')) {
					mySelf.$element.trigger('theater.rightBottom');
				}
			});

			this.$wrapper.find('.picturesSmall .slideControllers a.left').click(function() {
				mySelf.stopTimer();
				if(!mySelf.$element.find('.picturesSmall .listPictures .imagePanel').is(':animated')) {
					mySelf.$element.trigger('theater.leftBottom');					
				}
			});

			this.$wrapper.find('.picturesSmall .imagePanel').click(function() {
				mySelf.stopTimer();
				if(!mySelf.$wrapper.find('.switchPanelTop').is(':visible')) {
					mySelf.switchCategoryClick(this);
				}

			});

			this.$wrapper.find('.picturesSmall .imagePanel').mouseenter(function() {
				mySelf.categoryMouseOver(this);
			});

			this.$wrapper.find('.picturesSmall .imagePanel').mouseleave(function() {
				mySelf.categoryMouseOut(this);
			});
		},
		
		categoryMouseOver : function(element) {
			$(element).find('.overlay').hide();
		},
		
		categoryMouseOut : function(element) {
			this.$slidesBottom.find('.overlay').show();
			var $activeElement = $(element).parent().find('.imagePanel.active');
			$activeElement.find('.overlay').hide();

		},
		
		switchCategoryClick : function(element) {
			$(element).parent().find('.imagePanel').find('.overlay').show();
			$(element).parent().find('.imagePanel').removeClass('active');
			$(element).addClass('active');
			$(element).find('.overlay').hide();
			counter = parseInt($(element).index()+1);
			this.switchCategory(element);
			
		},
		
		switchCategory : function(element) {
			var catTitle = $(element).attr('data-category');
			var newWidth = 0;
			nextElement = this.$elements.filter('[data-category=' + catTitle + ']');
			$loader = this.$wrapper.find('.preloader');
			$panelTop = this.$panelTop;
			$panelBottom = this.$panelBottom;
			$elements = this.$elements;
			$panelTop.show();
			$panelBottom.show();

			$(element).parent().find('.overlay').show();
			$(element).parent().find('.innerContent').removeClass('active');
			$(element).addClass('active');
						
			//set new width of the active panel
			if(this.timerRunning) {
				$.each($(element), function() {
					newWidth += $(this).width();
				});				
				$(element).parent().width(newWidth);
			}else {
				$.each(nextElement, function() {
					newWidth += $(this).width();
				});					
				this.$wrapper.find('.imagesBig').width(newWidth);
				this.$wrapper.find('.imagesBig .innerContent').removeClass('active');
				nextElement.addClass('active');
			}

			this.$panelTop.animate({
				height : this.$slides.height() / 2
			}, {
				duration : 400,
				easing : this.options.animationEffect,
				complete : function() {
					$loader.fadeIn(100).delay(300).fadeOut(100);
					$(this).delay(500).animate({
						height : 0
					}, {
						duration : 500,
						complete : function() {
							$panelTop.hide();
						}
					});
				}
			});

			this.$panelBottom.animate({
				height : this.$slides.height() / 2
			}, {
				duration : 400,
				easing : this.options.animationEffect,
				complete : function() {
					$elements.hide();
					nextElement.show();
					//only when timer is on
					if(mySelf.timerRunning) {
						mySelf.shiftBottom('right');
					}
					$(element).find('.overlay').hide();
					$(this).delay(500).animate({
						height : 0
					}, {
						duration : 500,
						complete : function() {
							$panelBottom.hide();
						}
					});
				}
			});

			this.$slides = nextElement;
			this.$slides.css({
				'right' : '0px'
			});
			clickCount = 1;
		},
		shiftTop : function(action) {
			if(action == 'right') {
				clickCount++;
				if(clickCount <= this.$slides.length) {
					this.$slides.animate({
						right : '+=' + this.$slides.width() + ''
					}, {
						duration : this.options.animationSpeed,
						easing : this.options.animationEffect
					});
				} else {
					//if timer is disabled
					if(!mySelf.timerRunning) {
						clickCount = 1;
						this.$slides.animate({
							right : '0px'
						}, {
							duration : this.options.animationSpeed,
							easing : this.options.animationEffect
						});
					} else {
						//search all Categories					
						var catArray = [];					
						$.each(this.$elements,function(index, element){							
							catArray.push($(this).attr('data-category'));							
						});
						//remove all duplicate and sort nicely!
						catArray = jQuery.unique(catArray);
						catArray.reverse();	
						var next = catArray[counter++];		
										
						if(this.$element.find('.picturesSmall .imagePanel').length < counter) {
							next = catArray[0];
							counter = 1;
						}
						var nextElement = this.$element.find('.imagesBig .innerContent').filter('[data-category=' + next + ']');
						mySelf.switchCategory(nextElement);						
						this.stopTimer();
						this.startTimer();
					}

				}

			} else if(action == 'left') {
				if(clickCount > 1) {
					clickCount--;
					this.$slides.animate({
						right : '-=' + this.$slides.width() + ''
					}, {
						duration : this.options.animationSpeed,
						easing : this.options.animationEffect
					});
				}
			} else if(action == 'showInfos') {
				this.$element.find('.picturesBig .imagesBig .innerContent .additionalInfos').addClass('open').stop().animate({
					top : '282px'
				}, {
					duration : 200,
					easing : this.options.animationEffect,
					complete : function() {
						$(this).filter(':visible').children().fadeIn('fast');
					}
				});
			} else if(action == 'hideInfos') {
				this.$element.find('.picturesBig .imagesBig .innerContent .additionalInfos').stop().animate({
					top : '431px'
				}, {
					duration : 200,
					easing : this.options.animationEffect,
					complete : function() {
						$(this).removeClass('open');
						$(this).filter(':visible').children().fadeOut('fast');
					}
				});
			}

		},
		shiftBottom : function(action) {
			includeMarginWidth = this.$slidesBottom.width() + 6;			
			if(action == 'right') {								
				//only when timer starts
				
				if(this.timerRunning) {		
					clickCountBottom = parseInt(this.$slidesBottom.filter('.active').index()+1);	
					clickCountBottom++;							
					this.$slidesBottom.find('.overlay').show();
					this.$slidesBottom.removeClass('active');	
					this.$slidesBottom.eq(clickCountBottom - 1).addClass('active').find('.overlay').hide();					
				
					if(clickCountBottom % 5 == 0 && switchTimes > 0) {
						this.$slidesBottom.animate({
							right : '+=' + includeMarginWidth * 4 + ''
						}, {
							duration : this.options.animationSpeed,
							easing : this.options.animationEffect
						});	
						switchTimes--;
					}
					else if(clickCountBottom == this.$slidesBottom.length && restClick > 0) {
						this.$slidesBottom.animate({
							right : '+=' + includeMarginWidth + ''
						}, {
							duration : this.options.animationSpeed,
							easing : this.options.animationEffect
						});	
						restClick--;											
					}
					else if(clickCountBottom > this.$slidesBottom.length) {
						this.$slidesBottom.animate({
							right : '0px'
						}, {
							duration : this.options.animationSpeed,
							easing : this.options.animationEffect
						});	
						clickCountBottom = 1;
						switchTimes = (this.$slidesBottom.length - this.$slidesBottom.length % 4) / 4-1;
						restClick = this.$slidesBottom.length % 4;		
						this.$slidesBottom.eq(0).addClass('active').find('.overlay').hide();
					}					
				
				//only when timer starts				
				} else {									
					if(switchTimes > 0) {						
						this.$slidesBottom.animate({
							right : '+=' + includeMarginWidth * 4 + ''
						}, {
							duration : this.options.animationSpeed,
							easing : this.options.animationEffect
						});
						clickCountBottom += 4;
						switchTimes--;
					}else {						
						if(restClick > 0){
							this.$slidesBottom.animate({
								right : '+=' + includeMarginWidth + ''
								}, {
									duration : this.options.animationSpeed,
									easing : this.options.animationEffect
								});
							clickCountBottom++;
							restClick--;
						}else {
							this.$slidesBottom.animate({
								right : '0px'
								}, {
									duration : this.options.animationSpeed,
									easing : this.options.animationEffect
								});
							clickCountBottom = 1;
							switchTimes = (this.$slidesBottom.length - this.$slidesBottom.length % 4) / 4-1;
							restClick = this.$slidesBottom.length % 4;		
						}
						
					}
				}

			} else if(action == 'left') {
				restClick = 0;				
				if(clickCountBottom >= 5) {
					this.$slidesBottom.animate({
						right : '-=' + includeMarginWidth * 4 + ''
					}, {
						duration : this.options.animationSpeed,
						easing : this.options.animationEffect
					});
					clickCountBottom -=4;
					switchTimes++;
					restClick++;
				}else {					
					if(restClick > 0){
						this.$slidesBottom.animate({
							right : '-=' + includeMarginWidth + ''
						}, {
							duration : this.options.animationSpeed,
							easing : this.options.animationEffect
						});
						restClick--;
						
					}else {
						this.$slidesBottom.animate({
						right : '0px'
						}, {
							duration : this.options.animationSpeed,
							easing : this.options.animationEffect
						});
						clickCountBottom = 1;
						switchTimes = (this.$slidesBottom.length - this.$slidesBottom.length % 4) / 4-1;
						restClick = this.$slidesBottom.length % 4;
					}
					
				}
			}

		}
	};

	$.fn.theater = function(options) {
		return this.each(function() {
			var theater = $.extend({}, THEATER);
			theater.init(this, options);
		});
	};
})(jQuery);

( function($) {

	var options = {};

	$.event.special.imageready = {
		setup : function(data, namespaces, eventHandle) {
			options = data || options;
		},
		add : function(handleObj) {
			var $this = $(this), src;
			if(this.nodeType === 1 && this.tagName.toLowerCase() === 'img' && this.src !== '') {
				if(options.forceLoad) {
					src = $this.attr('src');
					$this.attr('src', '');
					bindToLoad(this, handleObj.handler);
					$this.attr('src', src);
				} else if(this.complete || this.readyState === 4) {
					handleObj.handler.apply(this, arguments);
				} else {
					bindToLoad(this, handleObj.handler);
				}
			}
		},
		teardown : function(namespaces) {
			$(this).unbind('.imageready');
		}
	};

	function bindToLoad(element, callback) {
		var $this = $(element);
		$this.bind('load.imageready', function() {
			callback.apply(element, arguments);
			$this.unbind('load.imageready');
		});

	}

}(jQuery));