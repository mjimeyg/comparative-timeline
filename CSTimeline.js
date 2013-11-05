(function($){
	var view_type = {
		'day' : 100,
		'month' : 200,
		'year' : 400
	};
	var month_names = Array(
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
		);
	
	var nav_displayed = false;
	$.fn.csTimeline = function(options){
		var timeline = $(this);
		
		timeline.css({
			'overflow': 'hidden'
		});
		var settings = $.extend({
			timeline_data: '',
			original_x: timeline.offset().left,
			original_y: timeline.offset().top,
			original_width: timeline.width(),
			original_height: timeline.height(),
			original_z: 1,
			category_count: 0,
			category_height: 100,
			category_bar_width: 250,
			event_width: 100,
			start_timestamp: 0,
			end_timestamp: 0,
			start_year: 0,
			end_year: 0,
			year_count : 0,
			period_view : view_type.year,
			period_length: 0,
			lang: {'select_year':'View by year', 'select_month':'View by month', 'select_day':'View by day'},
			fullscreen: false
		}, options);
		//console.log(settings);
		var counter = 0;
		if(settings.category_count == 0 || settings.start_year == 0 || settings.end_year ==0){
			$.each(settings.timeline_data, function(key, category){
			
				if(typeof category.events !== 'undefined')
				{
					settings.category_count += 1;
					$.each(category.events, function(event_key, event_obj){
						var d_date = new Date();
						d_date.setUTCFullYear(event_obj.date.year, event_obj.date.month -1, event_obj.date.day);
						d_date.setUTCHours(0,0,0,0);
						
						var t_time = Math.round(d_date.getTime() / 1000);
						if(counter == 0){
							settings.start_timestamp = t_time;
							counter++;
						}
						if(t_time > settings.end_timestamp)
						{
							settings.end_timestamp = t_time;
						}
						if(t_time < settings.start_timestamp)
						{
							
							settings.start_timestamp = t_time;
						}
					});
				}
			});
		}
		settings.start_year = new Date(settings.start_timestamp * 1000).getFullYear();
		settings.end_year = new Date(settings.end_timestamp * 1000).getFullYear();
		
		settings.year_count = settings.end_year - settings.start_year;
		
		$(this).bind('resize', function(e){
			clear_timeline($(this));
			draw_timeline($(this), settings);
		});
		
		draw_timeline($(this), settings);
		
	}
	
	function clear_timeline(parent){
		parent.empty();
	}
	
	function draw_timeline(timeline, settings){
		var category_bar = $('<div id="category_bar">')
							.css({
								'position' : 'absolute',
								'top' : (timeline.offset().top + 50) + 'px',
								'z-index': 1,
								'overflow': 'hidden'
							})
							.addClass('category_bar')
							.height(timeline.height() - 50)
							.width(settings.category_bar_width)
							.appendTo(timeline);
							
		
		var timeline_container = $('<div id="timeline_container">')
							.css({
								'position' : 'absolute',
								'left' : (category_bar.offset().left + category_bar.width()) + 'px',
								'top' : (timeline.offset().top + 50) + 'px',
								'overflow' : 'scroll',
								'z-index': 2
							})
							.height(timeline.height() - 50)
							.width(timeline.width() - 250)
							.scroll({'period_width' : settings.period_view}, timeline_panel_scroll)
							.appendTo(timeline);
		
		if(settings.end_timestamp - settings.start_timestamp == 0){
			var timeline_panel_width = 1 * settings.period_view;
		}
		else{
			var timeline_panel_width = (calculate_period(settings.end_timestamp - settings.start_timestamp, settings.period_view)  * settings.period_view) + settings.period_view;
		}
		
		var timeline_panel = $('<div id="timeline_panel">')
							.css({
								'position' : 'absolute',
								'min-height' : timeline.height() - 50 + 'px',
								'z-index': 3
							})
							.width(timeline_panel_width)
							.height(settings.category_count * 100)
							.mousemove({'settings' : settings, 'start_year' : settings.start_year, 'month_names' : month_names}, update_date_bar)
							
							.appendTo(timeline_container);
							
		var date_bar = $('<div id="date_bar">')
							.addClass('date_bar')
							.css({
								'position' : 'absolute',
								'left' : (category_bar.offset().left + category_bar.width()) + 'px',
							})
							.height(50)
							.width(timeline.width() - 250)
							.appendTo(timeline);
		
		var date_bar_day = $('<span id="date_bar_day">')
							.html('day')
							.appendTo(date_bar);
							
		var date_bar_month = $('<span id="date_bar_month">')
							.html('month')
							.appendTo(date_bar);
							
		var date_bar_year = $('<span id="date_bar_year">')
							.html('year')
							.appendTo(date_bar);
							
		var time_graph = $('<div id="time_graph">')
							.addClass('time_graph')
							.css({
								'position' : 'absolute',
								'left' : 0 + 'px',
								'top' : 25 + 'px',
								'overflow' : 'hidden'
							})
							.height(25)
							.width(date_bar.width())
							.appendTo(date_bar);
							
		var tool_bar = $('<div id="tool_bar">')
							.addClass('tool_bar')
							.appendTo(date_bar);
							
		var fullscreen = $('<div id="fullscreen">')
							.addClass('fullscreen')
							.html('Full Screen')
							.appendTo(tool_bar)
							.unbind('click').bind('click', function(e){
								if(settings.fullscreen){
									clear_timeline(timeline);
									
									timeline.css({
										'position':'static',
										/*'top': '0px',
										'left': '0px',*/
										'z-index': settings.original_z
									})
									.width(settings.original_width)
									.height(settings.original_height);
									
									
									draw_timeline(timeline, settings);
									
									$('#timeline_mask').remove();
									settings.fullscreen = false;
								}
								else{
									$('<div id="timeline_mask">')
										.css({
											'position':'absolute',
											'top':'0px',
											'left':'0px',
											'z-index': get_top_z_index() + 1
										})
										.addClass('timeline_mask')
										.width($(window).width())
										.height($(window).height())
										.appendTo('body');
									clear_timeline(timeline);
									
									timeline.css({
										'position':'absolute',
										'top': '0px',
										'left': '0px',
										'z-index': get_top_z_index() + 1
									})
									.width($(window).width())
									.height($(window).height());
									
									
									draw_timeline(timeline, settings);
									
									settings.fullscreen = true;
								}
							});
		
		// Build timeline grid
		var first_cat;
		var category_counter = 0;
		$.each(settings.timeline_data, function(key,value){
			if(category_counter == 0){
				first_cat = value;
			}
			category_counter++;
		});
		category_counter = 0;
		
		var event_category = $('<div id="' + first_cat.id + '">')
							.addClass('event_category')
							.css({
								'position' : 'absolute',
								'top' : 0 + 'px',
								'left' : 0 + 'px',
								'overflow' : 'hidden'
							})
							.width(timeline_panel_width)
							.height(settings.category_height)
							.appendTo(timeline_panel);
		
		var category_div = $('<div id="category_' + first_cat.id + '">')
						.addClass('category')
						.height(settings.category_height)
						.append(
							$('<div>')
								.addClass('category_title')
								.html(first_cat.title)
						)
						.append(
							$('<img>')
								.addClass('category_image')
								.attr("src", first_cat.image)
						)
						.css({
							'position': 'absolute',
							'top': category_counter * settings.category_height,
							'left': 0
						})
						.appendTo("#category_bar");
		
		var curr_x = 0;
		var curr_date = new Date(settings.start_timestamp * 1000);
		switch(settings.period_view){
			case view_type.month:
				curr_date = new Date(curr_date.getFullYear(), curr_date.getMonth(), 1,0,0,0);
				break;
			case view_type.year:
				curr_date = new Date(curr_date.getFullYear(), 0, 1,0,0,0,0);
				break;
		}
		while(curr_x <= timeline_panel_width){
			var empty_date_string;
			switch(settings.period_view){
				case view_type.day:
					empty_date_string = curr_date.getDate() + ' ' + month_names[curr_date.getMonth()] + ' ' + curr_date.getFullYear();
					break;
				case view_type.month:
					empty_date_string = month_names[curr_date.getMonth()] + ' ' + curr_date.getFullYear();
					break;
				case view_type.year:
					empty_date_string = curr_date.getFullYear();
					break;
			}
			var event_div = $('<div id="' + (curr_date.getTime() / 1000) + '">')
						.css({
							'position' : 'absolute',
							'top' : 0 + 'px',
							'left' : curr_x + 'px'
						})
						.height(settings.category_height)
						.width(settings.period_view)
						//.html(curr_
						.appendTo(event_category);
			
			switch(settings.period_view){
				case view_type.year:
					event_div.addClass('event_year');
					break;
				case view_type.month:
					event_div.addClass('event_month');
					break;
				case view_type.day:
					event_div.addClass('event_day');
					break;
			}
			
			var time_graph_bar =  $('<div id="' + (curr_date.getTime() / 1000) + '" name="time_graph_unit">')
							.addClass('time_graph_unit')
							.css({
								'position' : 'absolute',
								'top' : 0 + 'px',
								'left' : (curr_x) + 'px'
							})
							.width(settings.period_view)
							.height(25)
							.html(empty_date_string)
							.appendTo(time_graph);
			curr_x += settings.period_view;
			//console.log(curr_date.toDateString() + ' ' + curr_date.getTime());
			switch(settings.period_view){
			  case view_type.day:
				  curr_date = new Date(curr_date.getFullYear(), curr_date.getMonth(), curr_date.getDate() + 1);
				  break;
			  case view_type.month:
				  if(curr_date.getMonth() == 11){
					  curr_date = new Date(curr_date.getFullYear() + 1, 0 ,1);
				  }
				  else{
					  curr_date = new Date(curr_date.getFullYear(), curr_date.getMonth() + 1, 1);
				  }
				  break;
			  case view_type.year:
				  event_div.addClass('timeline_unit_year');
				  curr_date = new Date(curr_date.getFullYear() + 1, 0, 1);
				  break;
		  }
		  
		}
		
		category_counter = 0;
		$.each(settings.timeline_data, function(key, value){
			if(category_counter > 0){
				event_category.clone()
								.attr({
									'id' : value.id
								})
								.css({
									'top' : category_counter + 'px'
								})
								.appendTo(timeline_panel)
				
				category_div.clone()
								.attr({
									'id': 'category_' + value.id
								})
								.css({
									'top': category_counter + 'px',
								})
								.appendTo('#category_bar');
				$('#category_' + value.id + ' div').html(value.title);
				$('#category_' + value.id + ' img').attr('src', value.image);
			}
			category_counter += settings.category_height;
		});
		
		category_counter = 0;
		var event_galleries = Array();
		$.each(settings.timeline_data, function(key, category){
			if(category.events){
				
				$.each(category.events, function(event_key, event_obj){
					var d_date = e_date = new Date(event_obj.date.year, event_obj.date.month-1, event_obj.date.day,0,0,0,0);
					
					switch(settings.period_view){
						case view_type.day:
							//d_date = new Date(d_date.getFullYear(), d_date.getMonth(), 1);
							break;
						case view_type.month:
							d_date = new Date(d_date.getFullYear(), d_date.getMonth(), 1);
							break;
						case view_type.year:
							d_date = new Date(d_date.getFullYear(), 0, 1);
							break;
					}
					//console.log('#' + category.id + ' #' + d_date.getTime() / 1000 + ' ' + d_date.toDateString());
					
					var event_div = $('#' + category.id + ' #' + d_date.getTime() /1000);
					if(event_div.children().length > 0){
						//console.log('#' + category.id + ' #' + d_date.getTime() /1000 + ' has ' + event_div.children().length + ' children');
						event_div = $('#' + category.id + ' #' + d_date.getTime() /1000 + ' #gallery_controls #event_gallery #gallery');
						
					}
					else{
						event_div = $('#' + category.id + ' #' + d_date.getTime() /1000);
						event_div.append(
							$('<div id="gallery_controls">')
								.width(settings.period_view)
								.height(settings.category_height)
								.append(
									$('<a>')
										.attr({
											'id' : 'gallery_prev',
											'href' : '#'
										})
										.hide()
										.append(
											$('<img src="images/prev.png" alt="previous">')
										)
								)
								.append(
									$('<div id="event_gallery">')
										.css({
											'position': 'absolute',
											'left' : '20px',
											'top' : '0px',
											'overflow':'hidden'
										})
										.width(settings.period_view-40)
										.height(settings.category_height)
										.append(
											$('<div id="gallery">')
											.addClass('gallery')
											.height(settings.category_height)
									)
								)
								.append(
									$('<a>')
										.attr({
											'id' : 'gallery_next',
											'href' : '#'
										})
										.hide()
										.append(
											$('<img src="images/next.png" alt="next">')
										)
								)
						);
						event_div = $('#' + category.id + ' #' + d_date.getTime() /1000 + ' #gallery_controls #event_gallery #gallery');
					}
					var dialog_content = '<img src="' + event_obj.image + '" style="float:right;" />' + event_obj.description;
					var event_li = $('<div id="event_' + event_obj.id + '">')
								.width(settings.event_width)
								.addClass('event')
								.unbind('click')
								.bind('click', function(e){
									show_dialog(event_obj.title, dialog_content, $('body'));
								});
					
					var event_title = $('<div>')
								.addClass('event_title')
								.html(event_obj.title)
								.appendTo(event_li);
								
					var event_date = $('<div>')
								.addClass('event_date')
								.html(e_date.toLocaleDateString())
								.appendTo(event_li);
								
					var event_image = $('<img>')
								.addClass('event_img')
								.attr({
									'height' : settings.category_height - 20,
									'src' : event_obj.image
								})
								.appendTo(event_li);
					event_div.append(event_li);
					
					generate_gallery(settings, event_div);
				});
			}
			
			category_counter++;
		});
		
		// Build period view switch
		var period_switch_panel = $('<div id="period_switch_panel">')
									.css({
										'position': 'absolute',
										'top': timeline.offset().top + 'px',
										'left': timeline.offset().left + 'px',
										'z-index': get_top_z_index(timeline) + 1,
										'overflow': 'hidden'
									})
									.addClass('period_switch_panel')
									.width(category_bar.width())
									.height(category_bar.offset().top)
									.append(
										$('<div id="select_year">')
											.html(settings.lang.select_year)
											.addClass('select_year')
											.hide()
											.unbind('click').bind('click', function(e){
												settings.period_view = view_type.year;
												close_time_period_view_menu(settings.period_view);
												clear_timeline(timeline);
												draw_timeline(timeline, settings);
											})
											
									)
									.append(
										$('<div id="select_month">')
											.html(settings.lang.select_month)
											.addClass('select_month')
											.hide()
											.unbind('click').bind('click', function(e){
												settings.period_view = view_type.month;
												close_time_period_view_menu(settings.period_view);
												clear_timeline(timeline);
												draw_timeline(timeline, settings);
											})
									)
									.append(
										$('<div id="select_day">')
											.html(settings.lang.select_day)
											.addClass('select_day')
											.hide()
											.unbind('click').bind('click', function(e){
												settings.period_view = view_type.day;
												close_time_period_view_menu(settings.period_view);
												clear_timeline(timeline);
												draw_timeline(timeline, settings);
											})
									)
									.bind('mouseover', function(e){
										open_time_period_view_menu();
									})
									.bind('mouseout', function(e){
										close_time_period_view_menu(settings.period_view);
									})
									.appendTo(timeline);
									
		switch(settings.period_view){
			case view_type.year:
				$('#select_year').show();
				break;
			case view_type.month:
				$('#select_month').show();
				break;
			case view_type.day:
				$('#select_day').show();
				break;
		}
		
		// Create navigation controls
		timeline.unbind('click').bind('contextmenu', function(event){
			event.preventDefault();
			show_navigation(timeline, settings);
		});
		
		// Once the timeline is loaded we check to see if the browser uri is pointing to a specific id.
		var event_id = getURLParameter('event_id');
		var event_obj;
		
		if(event_id != null){
			event_obj = $("#event_" + event_id);
			//console.log(event_obj);
			
			var event_gallery = event_obj.parent().parent();
			
			//console.log(event_gallery.offset().left);
			
			timeline_container.scrollLeft(event_gallery.offset().left);
			
			event_gallery.scrollLeft(event_obj.offset().left);
			
			event_obj = null;
			
			$.each(settings.timeline_data, function(a, b){
				
				$.each(b.events, function(c, d){
					
					if(d.id == event_id){
						event_obj = d;
					}
				});
			});
			show_dialog(event_obj.title, event_obj.description, $('body'));
		}
		
		// Then check for a specific date.
	}
	
	function show_navigation(timeline, settings){
		if(!nav_displayed){
			var timeline_container = $('#timeline_container');
			var timeline_panel = $('#timeline_panel');
			var nav_panel = $('<div id="nav_panel">')
				.addClass('nav_panel')
				.css({
					'position': 'absolute',
					'z-index': 10000//get_top_z_index(timeline) + 1
				})
				.width(300)
				.height(100)
				.appendTo(timeline)
				.center($("#timeline_container"))
				.animate({opacity:0.8}, 500, 'swing');
				
			var prev_unit = $('<div id="prev_unit">')
				.addClass('prev_unit')
				.appendTo(nav_panel)
				.unbind('click').bind('click', function(event){
					if(timeline_container.scrollLeft() > 0){
						timeline_container.scrollLeft(timeline_container.scrollLeft() - settings.period_view);
					}
				});
			var prev_ten = $('<div id="prev_ten">')
				.addClass('prev_ten')
				.appendTo(nav_panel)
				.unbind('click').bind('click', function(event){
					if(timeline_container.scrollLeft() > 0){
						timeline_container.scrollLeft(timeline_container.scrollLeft() - settings.period_view);
						switch(settings.period_view){
							case view_type.year:
								break;
							case view_type.month:
								break;
							case view_type.day:
								break;
						}
					}
				});
			var next_unit = $('<div id="next_unit">')
				.addClass('next_unit')
				.appendTo(nav_panel)
				.unbind('click').bind('click', function(event){
					//console.log('clicked');
					if(timeline_container.scrollLeft() < (timeline_panel.width())){
						timeline_container.scrollLeft(timeline_container.scrollLeft() + settings.period_view);
					}
				});
			var next_ten = $('<div id="next_ten">')
				.addClass('next_ten')
				.appendTo(nav_panel)
				.unbind('click').bind('click', function(event){
					if(timeline_container.scrollLeft() < (timeline_panel.width())){
						
						switch(settings.period_view){
							case view_type.year:
				
								
								timeline_container.scrollLeft(timeline_container.scrollLeft() + (view_type.year * 10));
								break;
							case view_type.month:
								timeline_container.scrollLeft(timeline_container.scrollLeft() + (view_type.month * 12));
								break;
							case view_type.day:
								timeline_container.scrollLeft(timeline_container.scrollLeft() + (view_type.day * 30));
								break;
						}
					}
				});
				
			nav_displayed = true;
			
			timeline.unbind('click').bind('click', function(event){
				
				if(in_border(event.clientX, event.clientY, nav_panel)){
				}else{
					hide_navigation();
				}
			});
		}
	}
	
	function hide_navigation(){
		if(nav_displayed){
			var nav_panel = $('#nav_panel').empty()
								.remove();
						
			nav_displayed = false;
		}
	}
	
	function in_border(x, y, container){
		var in_x = (x > container.position().left) && (x < (container.position().left + container.width())) ? true : false;
		var in_y = (y > container.position().top) && (y < (container.position().top + container.height())) ? true : false;
		
		if(in_x && in_y){
			return true;
		}
		else{
			return false;
		}
	}
	
	function close_time_period_view_menu(selected_option){
		$('#period_switch_panel').height($('#category_bar').position().top);
		switch(selected_option){
			case view_type.year:
				$('#select_month').hide();
				$('#select_day').hide();
				break;
			case view_type.month:
				$('#select_year').hide();
				$('#select_day').hide();
				break;
			case view_type.day:
				$('#select_year').hide();
				$('#select_month').hide();
				break;
		}
	}
	
	function open_time_period_view_menu(){
		$('#period_switch_panel').height($('#period_switch_panel').height() + $('#select_year').height() + $('#select_month').height());
		$('#select_year').show();
		$('#select_month').show();
		$('#select_day').show();
	}
	
	function generate_gallery(settings, gallery){
		
		if(gallery.children()){
			var number_of_events = gallery.children().length;
			var gallery_width = number_of_events * (5 + settings.event_width + 5);
			
			
			
			gallery.width(gallery_width);
			
			if(gallery.width() > settings.period_view){
				gallery.parent().parent().children("#gallery_next").show();
				
				gallery.parent().parent().children("#gallery_prev").hide();
				
				
					
				gallery.parent().parent().children("#gallery_prev").unbind('click').bind('click', function(e){
					
					gallery.parent().animate({scrollLeft: gallery.parent().scrollLeft() - settings.event_width}, 300, 'swing', function(){
					
						if(gallery.parent().scrollLeft() == 0){
							gallery.parent().parent().children("#gallery_prev").hide();
						}
						
						if(gallery.parent().scrollLeft() <= (gallery.width() - gallery.parent().width())){
							gallery.parent().parent().children("#gallery_next").show();
						}
					});
				});
				
				gallery.parent().parent().children("#gallery_next").unbind('click').bind('click', function(e){
					
					gallery.parent().animate({scrollLeft: gallery.parent().scrollLeft() + settings.event_width}, 300, 'swing', function(){
					
						if(gallery.parent().scrollLeft() > 0){
							gallery.parent().parent().children("#gallery_prev").show();
						}
						
						if(gallery.parent().scrollLeft() >= (gallery.width() - gallery.parent().width())){
							gallery.parent().parent().children("#gallery_next").hide();
						}
						//console.log(gallery.parent().scrollLeft());
					});
				});
			}
			
			
		}
		
	}
	
	function get_nearest(settings){
		var timeline_container = $('#timeline_container');
		var x = $('#timeline_container').scrollLeft();
		var y = $('#timeline_container').scrollTop() - timeline_container.offset().top;
		var curr_timestamp;
		switch(settings.period_view){
			case view_type.day:
				curr_timestamp = (((((x / settings.period_view) * 60) * 60) * 24) + (settings.start_timestamp / 1000)) * 1000;
				var curr_date = new Date(curr_timestamp);
				
				var new_date = new Date(curr_date.getYear(), curr_date.getMonth() + 1, 1);
				
				break;
			
			case view_type.month:
				curr_timestamp = (((((x / settings.period_view) * 60) * 60) * 24) + settings.start_year) * 1000;
				var curr_date = new Date(curr_timestamp);
				var new_date = new Date(curr_date.getYear() + 1, 0, 1);
				break;
			
			case view_type.year:
				//console.log((((((x / e.data.settings.period_view) * 60) * 60) * 24) * 365) + e.data.settings.start_timestamp);
				curr_timestamp = ((((((x / settings.period_view) * 60) * 60) * 24) * 365) + (settings.start_timestamp / 1000)) * 1000;
				var curr_date = new Date(curr_timestamp);
				var new_date = new Date(curr_date.getYear() + 10, 0, 1);
				break;
		}
		return new_date;
	}
	
	function update_date_bar(e){
		var timeline_container = $('#timeline_container');
		var x = e.pageX + $('#timeline_container').scrollLeft() - timeline_container.offset().left;
		var y = e.pageY + $('#timeline_container').scrollTop() - timeline_container.offset().top;
		var curr_timestamp;
		switch(e.data.settings.period_view){
			case view_type.day:
				curr_timestamp = (((((x / e.data.settings.period_view) * 60) * 60) * 24) + e.data.start_year) * 1000;
				var curr_date = new Date(curr_timestamp);
				
				break;
			
			case view_type.month:
				curr_timestamp = (((((x / e.data.settings.period_view) * 60) * 60) * 24) + e.data.start_year) * 1000;
				var curr_date = new Date(curr_timestamp);
				//$('#date_bar_day').html(curr_date.getDate());
				
				break;
			
			case view_type.year:
				//console.log((((((x / e.data.settings.period_view) * 60) * 60) * 24) * 365) + e.data.settings.start_timestamp);
				curr_timestamp = ((((((x / e.data.settings.period_view) * 60) * 60) * 24) * 365) + e.data.start_year) * 1000;
				var curr_date = new Date(curr_timestamp);
				//$('#date_bar_day').html(curr_date.getDate());
				//$('#date_bar_month').html(e.data.month_names[curr_date.getMonth()]);
				
				break;
		}
		return curr_date;
	}
	
	function timeline_panel_scroll(e){
		var timeline_container = $('#timeline_container');
		var category_bar = $("#category_bar");
		var time_graph = $('#time_graph');
		
		time_graph.scrollLeft(timeline_container.scrollLeft());
		category_bar.scrollTop(timeline_container.scrollTop());
	}
	
	function calculate_period(x, period){
		
		var return_val = 0;
		switch(period){
			case view_type.day:
				return_val = Math.round(((x / 60) / 60) / 24);
				break;
			
			case view_type.month:
				return_val = Math.round(((((x / 60) / 60) / 24) / 365) * 12);
				//console.log('There are ' + return_val + ' months.');
				break;
			
			case view_type.year:
				return_val = Math.round((((x / 60) / 60) / 24) / 365);
				break;
			default:
				console.log('A view type was not specified.');
		}
		
		return return_val;
	}
	
	function show_dialog(title, message, parent, buttons, callback){
		
		var mask = $('<div id="mask">')
						.css({
							'position': 'absolute',
							'top': 0,
							'left': 0,
							'z-index': get_top_z_index() + 1
						})
						.width(parent.width())
						.height(parent.height())
						.addClass('mask')
						.appendTo(parent)
						.animate({
							'opacity': 0.8
						}, 400);
						
		var dialog_parent = $('<div id="dialog_parent">')
						.css({
							'z-index': get_top_z_index() + 1
						})
						.width(600)
						.height(600)
						.addClass('dialog')
						.appendTo(parent)
						.animate({
							'opacity': 1.0
						}, 800)
						.center(false);
						
		var close_button = $('<div id="close_button">')
						.addClass('dialog_close_button')
						.appendTo(dialog_parent)
						.unbind('click').bind('click', function(e){
							close_dialog();
						});
						
		var title_div = $('<div id="dialog_title">')
							.addClass('dialog_title')
							.html(title)
							.appendTo(dialog_parent);
							
		var dialog_content = $('<div id="dialog_content">')
							.addClass('dialog_content')
							.height(dialog_parent.height() - title_div.height() - 10)
							.width(dialog_parent.width() - 10)
							.css({
								'position': 'absolute',
								'top': title_div.height() + 5,
								'left': 5,
								'overflow': 'scroll'
							})
							.appendTo(dialog_parent);
							
		var message_div = $('<div id="dialog_message">')
							.css({
								'overflow': 'scroll'
							})
							.addClass('dialog_message')
							.html(message)
							.appendTo(dialog_content);
	}
	
	function close_dialog(){
		var close_button = $('#close_button')
						.animate({opacity: 0.0}, 400)
						.remove();
						
		
						
		var dialog_parent = $('#dialog_parent')
						.animate({
							width: 0 + 'px',
							height: 0 + 'px'
						}, 400)
						.empty()
						.remove();
						
		var mask = $('#mask')
						.animate({opacity:0.0}, 400)
						.remove();
	}
	
	function get_top_z_index(children){
		if(typeof(children) === 'undefined'){
			children = "*";
		}
		var top_z = 0;
		var auto_count = 0;
		$(children).each(function(){
			
			if(isNaN($(this).css('z-index'))){
				auto_count++;
			}
			else{
				var curr_z = parseInt($(this).css('z-index'));
				top_z = curr_z > top_z ? curr_z : top_z;
			}
		});
		top_z += auto_count;
		return top_z;
	}
	
	function getURLParameter(name) {
		return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
	}
	
	function daysInMonth(month, year) {
		return new Date(year, month, 0).getDate();
	}
})(jQuery)

jQuery.fn.center = function(parent) {
    if (parent) {
		this.css({
			"position": "absolute",
			"top": ((($(parent).height() - this.outerHeight()) / 2) + $(parent).offset().top + "px"),
			"left": ((($(parent).width() - this.outerWidth()) / 2) + $(parent).offset().left + "px")
		});
    } else {
        this.css({
			"position": "absolute",
			"top": (((window.innerHeight - this.outerHeight()) / 2) + 0 + "px"),
			"left": (((window.innerWidth - this.outerWidth()) / 2) + 0 + "px")
		});
    }
	
	return this;
}