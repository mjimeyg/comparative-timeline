$.widget("consof.csTimeline", {
	_view_type: {
		'day' : 100,
		'month' : 200,
		'year' : 400
	},
	
	_month_names: [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
	],
	
	options: {
			timeline_data: '',
			category_count: 0,
			category_height: 100,
			category_bar_width: 100,
			visible_categories: 0,
			visible_events: 0,
			event_width: 100,
			start_timestamp: 0,
			end_timestamp: 0,
			start_year: 0,
			end_year: 0,
			year_count : 0,
			period_length: 0,
			lang: {'select_year':'View by year', 'select_month':'View by month', 'select_day':'View by day'},
			fullscreen: false,
			debug: 0,
			nav_displayed: false,
			pluginIdPrefix: '',
			navigator_height: 40,
			current_year: 0,
			event_ajax_url: null,
			current_angle: 0
	},
	
	_create: function(){
		/*** START DEBUG ***/
		if(this.options.debug > 0){
			console.log("Loading...");
			if(this.options.debug > 1){
				console.log("Options:");
				console.log(this.options);
			}
		}
		/*** END DEBUG ***/
		
		this.options = $.extend(this.options, {
			original_x: this.element.offset().left,
			original_y: this.element.offset().top,
			original_width: this.element.width(),
			original_height: this.element.height(),
			period_view : this._view_type.year,
			original_z: 1,
		});
		
		this.options.pluginIdPrefix = this.element.attr('id');
		
		
		var counter = 0, opts = this.options;
		if(this.options.category_count == 0 || this.options.start_year == 0 || this.options.end_year ==0){
			$.each(this.options.timeline_data, function(key, category){
				
				if(typeof category.events.length !== 'undefined')
				{
					opts.category_count += 1;
					$.each(category.events, function(event_key, event_obj){
						/*console.log('here');
						console.log(event_obj);*/
						var d_date = new Date(event_obj.date);
						/*d_date.setUTCFullYear(event_obj.date.year, event_obj.date.month -1, event_obj.date.day);
						d_date.setUTCHours(0,0,0,0);*/
						
						var t_time = Math.round(d_date.getTime() / 1000);
						if(counter == 0){
							opts.start_timestamp = t_time;
							counter++;
						}
						if(t_time > opts.end_timestamp)
						{
							opts.end_timestamp = t_time;
						}
						if(t_time < opts.start_timestamp)
						{
							
							opts.start_timestamp = t_time;
						}
					});
				}
			});
		}
		this.options.start_year = new Date(this.options.start_timestamp * 1000).getFullYear();
		this.options.end_year = new Date(this.options.end_timestamp * 1000).getFullYear();
		
		this.options.year_count = this.options.end_year - this.options.start_year;
		
		this.options.visible_categories = Math.floor(this.element.height() / this.options.category_height);
		this.options.visible_events = Math.floor(this.element.width() / this.options.event_width);
		
		if(this.options.current_year == 0){
			this.options.current_year = this.options.start_year;
		}
		
		
		this.element.css({
			overflow: 'hidden'
		});
		
		/*** START DEBUG ***/
		if(this.options.debug > 1){
			console.log("Combined options:");
			console.log(this.options);
		}
		
		/*** END DEBUG ***/
		this._initialiseGrid();
		this._initialiseNavigator();
		this._initialiseCategoryBar();
		this._initialiseNavigatorControls();
		
		/*** START DEBUG ***/
		if(this.options.debug > 0){
			console.log("Loading complete.");
		}
		/*** END DEBUG ***/
	},
	
	_setOption: function(key, value){
		this.options[key] = value;
		this._update();
	},
	
	_update: function(){
	},
	
	_initialiseNavigator: function(){
		/*** START DEBUG ***/
		if(this.options.debug > 0){
			console.log("Initialising navigator...");
		}
		/*** END DEBUG ***/
		
		var nav_scroll = $('<div id="' + this.options.pluginIdPrefix + '_navigator_scroll_container">')
			.css({
				position: 'absolute',
				top: '0px',
				left: this.options.category_bar_width + 'px',
				height: this.options.navigator_height + 'px',
				width: this.options.original_width + 'px',
				overflow: 'hidden'
			})
			.addClass('csTimelineNavigatorScrollContainer')
			.appendTo(this.element);
		
		var nav = $('<div id="' + this.options.pluginIdPrefix + '_navigator">')
			.css({
				position: 'absolute',
				width: ((this.options.year_count) * 12) * this.options.event_width + 'px',
				height: this.options.navigator_height + 'px',
				top: '0px',
				left: '0px'
			})
			.addClass('csTimelineNavigator')
			.appendTo(nav_scroll);
			
		var year_spacer_pos = (((this.options.year_count * 12) * this.options.event_width) / (this.options.year_count * 12));
		
		
		for(var i = 0; i < this.options.year_count; i++){
			
			for(var j = 0; j < 12; j++){
				var spacer = $('<div id="' + this.options.pluginIdPrefix + '_spacer_' + (this.options.start_year + i) + '_' + j + '">')
					.css({
						position: 'absolute',
						bottom: '0px',
						left: (j * year_spacer_pos) + (i * (year_spacer_pos * 12)) + 'px'
					})
					.addClass('csTimelineSpacer')
					.appendTo(nav);
					
				var label = $('<div id="' + this.options.pluginIdPrefix + '_label_' + (this.options.start_year + i) + '_' + j + '">')
					/*.css({
						position: 'absolute',
						bottom: '0px',
						left: (j * year_spacer_pos) + (i * (year_spacer_pos * 12)) + 'px'
					})*/
					.addClass('csTimelineLabel')
					.html(this._month_names[j])
					.appendTo(spacer);
			}
		}
		
		var current_date_indicator = $('<div id="' + this.options.pluginIdPrefix + '_current_date_indicator">')
			.css({
				position: 'absolute',
				width: '1px',
				height: this.options.original_height - this.options.navigator_height + 'px',
				'background-color': 'black',
				top: this.options.navigator_height + 'px',
			})
			.addClass('csTimelineCurrentDateIndicator')
			.appendTo(this.element);
			
		var indicator_left = (((this.options.original_width - 100) / 2) + this.options.category_bar_width) - current_date_indicator.width();
		
		current_date_indicator.css({
			left: indicator_left
		});
		
		var current_date_label = $('<div id="' + this.options.pluginIdPrefix + '_current_date_label">')
			.addClass('csTimelineCurrentDateLabel')
			.css({
				position: 'absolute',
				top: (this.options.original_height - this.options.navigator_height) / 2 + 'px',
			})
			.html(this.options.start_year)
			.appendTo(this.element);
			
		var current_date_label_left = (((this.options.original_width - 100) / 2) + this.options.category_bar_width) - (current_date_label.width() / 2);
		current_date_label.css('left', current_date_label_left);
		/*** START DEBUG ***/
		if(this.options.debug > 0){
			console.log("Navigator initialised.");
		}
		/*** END DEBUG ***/
	},
	
	_initialiseCategoryBar: function(){
		/*** START DEBUG ***/
		if(this.options.debug > 0){
			console.log("Initialising category bar...");
		}
		
		var cat_scroll = $('<div id="' + this.options.pluginIdPrefix + '_category_scroll_container">')
			.css({
				position: 'absolute',
				top: this.options.navigator_height + 'px',
				left: '0px',
				height: (this.options.original_height - this.options.navigator_height) + 'px',
				width: this.options.category_bar_width + 'px',
				overflow: 'hidden'
			})
			.addClass('csTimelineCategoryBarScrollContainer')
			.appendTo(this.element);
			
		var cat = $('<div id="' + this.options.pluginIdPrefix + '_category_bar">')
			.css({
				position: 'absolute',
				top: '0px',
				left: '0px',
				width: this.options.category_bar_width + 'px',
				height: (this.options.category_height * this.options.category_count) + 'px',
			})
			.addClass('csTimelineCategoryBar')
			.appendTo(cat_scroll);
		
		var opts = this.options;
		for(var i = 0; i < this.options.category_count; i++){
			
			var cat_item = $('<div id="' + this.options.pluginIdPrefix + '_category_bar_item_' + this.options.timeline_data[i].id +'">')
				.css({
					position: 'absolute',
					top: (this.options.category_height * i) + 'px',
					left: '0px',
					width: this.options.category_bar_width + 'px',
					height: this.options.original_height - this.options.navigator_bar_height + 'px'
					
				})
				.addClass('csTimelineCategoryBarItem')
				.appendTo(cat);
			
			if(i % 2 == 0){
				cat_item.addClass('csTimelineOddCategoryBarItem');
			}else{
				cat_item.addClass('csTimelineEvenCategoryBarItem');
			}
			
			var cat_image = $('<img id="' + this.options.pluginIdPrefix + '_category_image_' + this.options.timeline_data[i].id + '">')
				.attr({
					src: this.options.timeline_data[i].image,
				})
				.addClass('csTimelineCategoryImage')
				.appendTo(cat_item);
				
			var cat_title = $('<div id="' + this.options.pluginIdPrefix + '_category_title_' + this.options.timeline_data[i].id + '">')
				.html(this.options.timeline_data[i].title)
				.addClass('csTimelineCategoryTitle')
				.appendTo(cat_item);
		}
		
		/*** START DEBUG ***/
		if(this.options.debug > 0){
			console.log("Category bar initialised.");
		}
	},
	
	_initialiseGrid: function(){
		/*** START DEBUG ***/
		if(this.options.debug > 0){
			console.log("Initialising grid...");
		}
		/*** END DEBUG ***/
		
		this.element
			.css({
				/*overflow: 'scroll'*/
			})
			.addClass('csTimeline');
		
		var grid_container = $('<div id="' + this.options.pluginIdPrefix + '_grid_container">')
			.css({
				position: 'absolute',
				top: this.options.navigator_height + 'px',
				left: this.options.category_bar_width + 'px',
				height: (this.options.original_height - this.options.navigator_height) + 'px',
				width: this.options.original_width + 'px',
				overflow: 'scroll'
			})
			.addClass('csTimelineGridContainer')
			.on("scroll", this.options, this._onGridScroll)
			.appendTo(this.element);
			
		for(var i = 0; i < this.options.category_count; i++){
			
			//console.log('Comic count for - ' + this.options.timeline_data[i].title + ': ' + this.options.timeline_data[i].events.length);
			var cat = $('<div id="' + this.options.pluginIdPrefix + '_category_' + this.options.timeline_data[i].id + '">')
				.css({
					position: 'absolute',
					top: (i * this.options.category_height) + 'px',
					left: '0px',
					height: this.options.category_height + 'px',
					width: ((this.options.year_count * 12) * this.options.event_width) + 'px'
				})
				.addClass('csTimelineCategory')
				.appendTo(grid_container);
				
				if(i % 2 == 0){
					cat.addClass('csTimelineOddCategory');
				}else{
					cat.addClass('csTimelineEvenCategory');
				}
				
				var opts = this.options;
				var oThis = this;
				
				$.each(this.options.timeline_data[i].events, function(index, value){
					//console.log('Comic count for - ' + opts.timeline_data[i].title + ': ' + value.description);
					var eDate = new Date(value.date);
					
					var period_container = null;
					var period_container_scroller = null;
					if($('#' + opts.pluginIdPrefix + '_period_container_scroller_' + opts.timeline_data[i].id + '_' + (((eDate.getFullYear() - opts.start_year) * 12) + eDate.getMonth())).length){
						
						period_container = $('#' + opts.pluginIdPrefix + '_period_container_' + opts.timeline_data[i].id + '_' + (((eDate.getFullYear() - opts.start_year) * 12) + eDate.getMonth()));
						
						period_container_scroller = $('#' + opts.pluginIdPrefix + '_period_container_scroller_' + opts.timeline_data[i].id + '_' + (((eDate.getFullYear() - opts.start_year) * 12) + eDate.getMonth()));
					}else{
						
						period_container = $('<div id="' + opts.pluginIdPrefix + '_period_container_' + opts.timeline_data[i].id + '_' + (((eDate.getFullYear() - opts.start_year) * 12) + eDate.getMonth()) + '">');
						period_container.css({
								position: 'absolute',
								top: '0px',
								left: (((eDate.getFullYear() - opts.start_year) * 12) + eDate.getMonth()) * opts.event_width + 'px',
								height: opts.category_height,
								width: opts.event_width,
								overflow: 'hidden'
							})
						.addClass('csPeriodContainer');
						cat.append(period_container);
						
						period_container_scroller = $('<div id="' + opts.pluginIdPrefix + '_period_container_scroller_' + opts.timeline_data[i].id + '_' + (((eDate.getFullYear() - opts.start_year) * 12) + eDate.getMonth()) + '">');
						period_container_scroller.css({
								position: 'absolute',
								top: '0px',
								left: '0px',
								height: opts.category_height,
								width: opts.event_width,
								overflow: 'hidden'
							})
						.addClass('csPeriodContainerScroller');
						period_container.append(period_container_scroller);
					}
					//console.log(opts.pluginIdPrefix + '_period_container_scroller_' + (((eDate.getFullYear() - opts.start_year) * 12) + eDate.getMonth()));
					//console.log(opts.pluginIdPrefix + '_period_container_scroller_' + (((eDate.getFullYear() - opts.start_year) * 12) + eDate.getMonth()));
					var eve = $('<div id="' + opts.pluginIdPrefix + '_event_' + value.id + '">')
						.css({
							position: 'absolute',
							top: '0px',
						})
						.addClass('csTimelineEvent')
						.on('mouseover', function(event){
							$(this).addClass('csTimelineEventHover');
							$(this).removeClass('csTimelineEvent');
						})
						.on('mouseout', function(event){
							$(this).addClass('csTimelineEvent');
							$(this).removeClass('csTimelineEventHover');
						})
						.on('click', {id: value.id, options: opts}, oThis._eventClicked)
						.appendTo(period_container_scroller);
					
					if(period_container_scroller.children('.csTimelineEvent').length > 1){
						//console.log(period_container_scroller.children('.csTimelineEvent').width());
						var width = period_container_scroller.children('.csTimelineEvent').width() + 4;
						eve.css('left', width * (period_container_scroller.children('div').length - 1));
					}else{
						eve.css('left', 2);
					}
					//console.log(width);
					var eve_image = $('<img id="' + opts.pluginIdPrefix + '_event_image_' + value.id + '">')
						.attr({
							src: value.image
						})
						.addClass('csTimelineEventImage')
						.appendTo(eve);
						
					var eve_title = $('<div id="' + opts.pluginIdPrefix + '_event_title_' + value.title + '">')
						.addClass('csTimelineEventTitle')
						.html(value.title)
						.appendTo(eve);
					
					
					//console.log(period_container_scroller.children('.csTimelineEvent :last').position().left + period_container_scroller.children('.csTimelineEvent :last').width());
					if((period_container_scroller.children('.csTimelineEvent :last').position().left + period_container_scroller.children('.csTimelineEvent :last').width()) > period_container_scroller.width()){
						//console.log(period_container_scroller.children('.csTimelineEvent :last').position().left);
						
						var left_arrow = $('<div id="' + opts.pluginIdPrefix + '_period_container_scroller_left_' + opts.timeline_data[i].id + '">')
							.css({
								position: 'absolute',
								left: '0px'
							})
							.addClass('csTimelinePeriodContainerLeftHidden')
							.on('click', 
								function(event){
									var right_scroll_button = $(this).parent().children('.csTimelinePeriodContainerRightHidden');
									$(right_scroll_button).addClass('csTimelinePeriodContainerRight');
									$(right_scroll_button).removeClass('csTimelinePeriodContainerRightHidden');
									
									var eve = $($(this).parent().children('.csPeriodContainerScroller').get(0)).children('.csTimelineEvent').get(0);
									var scroller = $(this).parent().children('.csPeriodContainerScroller').get(0);
									var scroll_dist = $(scroller).scrollLeft() - $(eve).width();
									$(scroller).scrollLeft(scroll_dist);
									var last_eve = $($(this).parent().children('.csPeriodContainerScroller').get(0)).children('.csTimelineEvent :last');
									
									if($(scroller).scrollLeft() == 0){
										$(this).addClass('csTimelinePeriodContainerLeftHidden');
										$(this).removeClass('csTimelinePeriodContainerLeft');
									}
								}
							)//this._scrollPeriodContainerLeft)
							.appendTo(period_container);
							
						var right_arrow = $('<div id="' + opts.pluginIdPrefix + '_period_container_scroller_right_' + opts.timeline_data[i].id + '">')
							.css({
								position: 'absolute',
								right: '0px'
							})
							.addClass('csTimelinePeriodContainerRight')
							.on('click', 
								function(event){
									var left_scroll_button = $(this).parent().children('.csTimelinePeriodContainerLeftHidden');
									$(left_scroll_button).addClass('csTimelinePeriodContainerLeft');
									$(left_scroll_button).removeClass('csTimelinePeriodContainerLeftHidden');
									
									var eve = $($(this).parent().children('.csPeriodContainerScroller').get(0)).children('.csTimelineEvent').get(0);
									var scroller = $(this).parent().children('.csPeriodContainerScroller').get(0);
									var scroll_dist = $(scroller).scrollLeft() + $(eve).width();
									$(scroller).scrollLeft(scroll_dist);
									var last_eve = $($(this).parent().children('.csPeriodContainerScroller').get(0)).children('.csTimelineEvent :last');//.get(0);
									if($(scroller).scrollLeft() + $(scroller).innerWidth() >= scroller.scrollWidth){
										$(this).addClass('csTimelinePeriodContainerRightHidden');
										$(this).removeClass('csTimelinePeriodContainerRight');
									}
								}
							)//this._scrollPeriodContainerRight)
							.appendTo(period_container);
					}
					
				});
				
				if(this.options.debug > 2){
					for(var j = 0; j < this.options.year_count; j++){
						var test = $('<div id="test_' + this.options.timeline_data[i].id + '_' + j + '">')
							.css({
								position: 'absolute',
								top: '0px',
								left: (j * this.options.event_width) + 'px',
								width: this.options.event_width,
								height: this.options.category_height,
								'border-color': 'black',
								'border-width': 'thin',
								'border-style': 'solid'
							})
							.appendTo(cat);
					}
				}
		}
		
		/*** START DEBUG ***/
		if(this.options.debug > 0){
			console.log("Grid initialised.");
		}
		/*** END DEBUG ***/
	},
	
	_initialiseNavigatorControls: function(){
		var opts = this.options;
		var oThis = this;
		var panel = $('<div id="' + this.options.pluginIdPrefix + '_navigator_control_panel">')
			.css({
				position: 'absolute',
				bottom: '-100px',
				right: '0px',
				width: (this.options.original_width - this.options.category_bar_width) + 'px',
				height: '125px'
			})
			.addClass('csTimelineNavigatorControlPanel');
			
		var tab = $('<div id="' + this.options.pluginIdPrefix + '_navigator_control_panel_tab">')
			.css({
				position: 'absolute',
				top: '0px',
				left: '0px',
				width: (this.options.original_width - this.options.category_bar_width) + 'px',
				height: '25px'
			})
			.addClass('csTimelineNavigatorControlPanelTab')
			.on('click', function(event){
				
				if(($('#' + opts.pluginIdPrefix).height() - panel.position().top) == 25){
					panel.animate({
						bottom: '0px'
					},
					500);
					/*** START DEBUG ***/
					if(opts.debug > 0){
						console.log("Navigator Panel opened.");
					}
					/*** END DEBUG ***/
				}else
				{
					panel.animate({
						bottom: '-100px'
					},
					500);
					/*** START DEBUG ***/
					if(opts.debug > 0){
						console.log("Navigator Panel closed.");
					}
					/*** END DEBUG ***/
				}
			})
			.appendTo(panel);
			
			var content = $('<div id="' + this.options.pluginIdPrefix + '_navigator_control_panel_content">')
				.css({
					position: 'absolute',
					top: '25px',
					left: '0px',
					width: (this.options.original_width - this.options.category_bar_width) + 'px',
					height:  '100px' 
				})
				.addClass('csTimelineNavigatorControlPanelContent')
				.appendTo(panel);
			
			var hidden_year = $('<input type="hidden" id="' + opts.pluginIdPrefix + '_navigator_control_panel_hidden_year">')
				.appendTo(content);
				
			var hidden_category = $('<input type="hidden" id="' + opts.pluginIdPrefix + '_navigator_control_panel_hidden_category">')
				.appendTo(content);
			
			var year_container = $('<div id="' + opts.pluginIdPrefix + '_navigator_control_panel_years_container">')
				.addClass('csTimelineNavigatorControlPanelYearsContainer');
				
			var years_label = $('<label id="' + opts.pluginIdPrefix + '_navigator_control_panel_years_label" for="' + opts.pluginIdPrefix + '_navigator_control_panel_years">')
				.addClass('csTimelineNavigatorControlPanelYearsLabel')
				.html('Select Year:')
				.appendTo(year_container);
			
			var years_list = $('<select id="' + opts.pluginIdPrefix + '_navigator_control_panel_years">')
				.addClass('csTimelineNavigatorControlPanelYears')
				.appendTo(year_container);
			
			var years = [];
			
			$.each(opts.timeline_data, function(i, j){
				//console.log(j);
				for(var k = 0; k < j.events.length; k++){
					var d = new Date(j.events[k].date);
					//console.log(d.getFullYear());	
					if($.inArray(d.getFullYear(), years) < 0){
						years.push(d.getFullYear());
					}
				}
			});
			years.sort();
			//console.log(years);
			
			for(var i = 0; i< years.length; i++){
				var select_item = $('<option>')
					.attr('value', years[i])
					.addClass('csTimelineNavigatorControlPanelYearsItem')
					.html(years[i])
					.appendTo(years_list);
			}
			
			var go_button_year = $('<div id="' + opts.pluginIdPrefix + '_navigator_control_panel_go_year">')
				.addClass('csTimelineNavigatorControlPanelGoYear')
				.on('click', function(event){
					
					var num_years = $('#' + opts.pluginIdPrefix + '_navigator_control_panel_years').val() - opts.start_year;
					var pos = (num_years * 12) * opts.event_width;
					$('#' + opts.pluginIdPrefix + '_grid_container').scrollLeft(pos);
					var eventObject = {data: oThis.options};
					oThis._onGridScroll(eventObject);
				})
				.appendTo(year_container);
				
			content.append(year_container);
			
			var category_container = $('<div id="' + opts.pluginIdPrefix + '_navigator_control_panel_category_container">')
				.addClass('csTimelineNavigatorControlPanelCategoriesContainer');
				
			var categories_label = $('<label id="' + opts.pluginIdPrefix + '_navigator_control_panel_years_label" for="' + opts.pluginIdPrefix + '_navigator_control_panel_categories">')
				.addClass('csTimelineNavigatorControlPanelYearsLabel')
				.html('Select Comic:')
				.appendTo(category_container);
				
			var categories_list = $('<select id="' + opts.pluginIdPrefix + '_navigator_control_panel_categories">')
				.addClass('csTimelineNavigatorControlPanelCategories');
			
			var div = $('<div>')
				.addClass('ui-widget')
				.append(categories_list);
			
			var categories_array = [];
			for(var i = 0; i < this.options.category_count; i++){
				var c = this.options.timeline_data[i];
				var path = c.image.substr(0, c.image.lastIndexOf('.'));
				var ext = c.image.substr(c.image.lastIndexOf('.'));
				var image = path + '/standard_small' + ext;
				
				var cat = {label: c.title,
							value: c.id,
							icon: image
				};
				
				categories_array.push(cat);
			}
			
			for(var i = 0; i< categories_array.length; i++){
				var cat = categories_array[i];
				var select_item = $('<option>')
					.attr('value', cat.value)
					.addClass('csTimelineNavigatorControlPanelCategoriesItem')
					.html(cat.label)
					.appendTo(categories_list);
			}
			category_container.append(categories_list);
			
			var go_button_category = $('<div id="' + opts.pluginIdPrefix + '_navigator_control_panel_go_category">')
				.addClass('csTimelineNavigatorControlPanelGoCategory')
				.on('click', function(event){
					var val = $('#' + opts.pluginIdPrefix + '_navigator_control_panel_categories').val();
					var cat = $('#' + opts.pluginIdPrefix + '_category_' + val)
					console.log(cat);
					var pos = cat.position().top;
					var grid_container = $('#' + opts.pluginIdPrefix + '_grid_container');
					console.log('<div id="' + opts.pluginIdPrefix + '_category_' + val);
					grid_container.scrollTop(pos);
					var eventObject = {data: oThis.options};
					oThis._onGridScroll(eventObject);
				})
				.appendTo(category_container);
			content.append(category_container);
		panel.appendTo(this.element);
	},
	
	_onGridScroll: function(eventObject){
		/*** START DEBUG ***/
		if(eventObject.data.debug > 1){
			console.log("Grid scrolled.");
		}
		/*** END DEBUG ***/
		
		var grid_container = $('#' + eventObject.data.pluginIdPrefix + '_grid_container');
		
		$('#' + eventObject.data.pluginIdPrefix + '_category_scroll_container').scrollTop(grid_container.scrollTop());
		
		$('#' + eventObject.data.pluginIdPrefix + '_navigator_scroll_container').scrollLeft(grid_container.scrollLeft());
		
		var current_date_indicator = $('#' + eventObject.data.pluginIdPrefix + '_current_date_indicator');
		
		// Convert grid x to year.
		
		
		var left_pos = grid_container.scrollLeft() + current_date_indicator.position().left;
		
		var new_year = Math.floor((left_pos / eventObject.data.event_width) / 12) + eventObject.data.start_year;
		
		if(new_year != eventObject.data.current_year){
			eventObject.data.current_year = new_year;
			$('#' + eventObject.data.pluginIdPrefix + '_current_date_label').html(new_year);
		}
	},
	
	_scrollPeriodContainerLeft: function(event){
		console.log('Left clicked');
	},
	
	_scrollPeriodContainerRight: function(event){
		console.log('Right clicked');
	},
	
	_eventClicked: function(event){
		var opts = event.data.options;
		var modal = $('<div id="' + event.data.options.pluginIdPrefix + '_dialog_modal">')
			.addClass('csTimelineDialogModal')
			.on('click', function(event){
				$('#' + opts.pluginIdPrefix + '_dialog').remove();
				$('#' + opts.pluginIdPrefix + '_dialog_modal').remove();
			})
			.appendTo($('#' + opts.pluginIdPrefix));
		var dialog = $('<div id="' + event.data.options.pluginIdPrefix + '_dialog">')
			.addClass('csTimelineDialog');
			
		var content = $('<div id="' + event.data.options.pluginIdPrefix + '_dialog_content">')
			.addClass('csTimelineDialogContent')
			.appendTo(dialog);
			
		var exit_button = $('<div id="' + event.data.options.pluginIdPrefix + '_dialog_exit_button">')
			.addClass('csTimelineDialogExitButton')
			.one('click', function(event){
				console.log('Exit button clicked');
				$('#' + opts.pluginIdPrefix + '_dialog').remove();
				$('#' + opts.pluginIdPrefix + '_dialog_modal').remove();
			})
			.appendTo(dialog);
			
		var request = $.ajax({
			url: event.data.options.event_ajax_url,
			type: 'POST',
			data: {id: event.data.id}
		});
		
		request.done(function(msg){
			content.html(msg);
			
			dialog.appendTo($('#' + opts.pluginIdPrefix));
			dialog.center(modal);
		});
		
		request.fail(function(msg){
			console.log(msg);
		});
	},
	
	getURLParameter: function (name) {
		return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
	},
	
	daysInMonth: function (month, year) {
		return new Date(year, month, 0).getDate();
	}
});

jQuery.fn.center = function(parent) {
    if (parent) {
		this.css({
			"position": "absolute",
			"top": (($(parent).height() / 2) - (this.outerHeight() / 2) + "px"),
			"left": (($(parent).width() / 2) - (this.outerWidth() / 2) + "px")
		});
		console.log(this.outerWidth());
    } else {
        this.css({
			"position": "absolute",
			"top": (((window.innerHeight - this.outerHeight()) / 2) + 0 + "px"),
			"left": (((window.innerWidth - this.outerWidth()) / 2) + 0 + "px")
		});
    }
	
	return this;
}