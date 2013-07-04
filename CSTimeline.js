(function($){
	
	var timeline_panel_curr_pos = 0;
	var debug = true;
	var view_type = {
		'day' : 100,
		'month' : 200,
		'year' : 400
	};
	$.fn.csTimeline = function(options){
		
		var d_date = new Date();
		
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
		
		var zoom_multiplier = 1;
		
		
		
		// How much detail can we see, do we see individual days or just months or years?
		var period_view = view_type.day;
		
		// The length in pixels of each individual time unit e.g. day, month, year.
		var period_width = 100;
		
		
		var category_height = 100;
		
		// Set up defaults and options
		var settings = $.extend({
			timeline_data: '',
			category_count: 0,
			start_year: 0,
			end_year: 0,
			year_count : 0,
			period_view : view_type.month,
			period_length: 0
		}, options);
		
		
		// Determine number of categories, start year and end year
		
		var start_year = 0;
		var end_year = 0;
		
		$.each(settings.timeline_data, function(key, category){
			
			if(typeof category.events !== 'undefined')
			{
				settings.category_count += 1;
				$.each(category.events, function(event_key, event_obj){
					
					if(event_obj.date > end_year)
					{
						end_year = event_obj.date;
					}
					
					if(event_obj.date < start_year)
					{
						start_year = event_obj.date;
					}
				});
			}
		});
		
		settings.end_year = new Date(end_year * 1000).getFullYear();
		settings.start_year = new Date(start_year * 1000).getFullYear();
		
		settings.year_count = settings.end_year - settings.start_year;
		
		// Build a basic array of dates to use when building the date bar
		var calendar = Array()
		
		calendar[0] = Array(12);
		
		calendar[0][0] = 31;		// January
		calendar[0][1] = daysInMonth(2, settings.start_year);		// February
		calendar[0][2] = 31;		// March
		calendar[0][3] = 30;		// April
		calendar[0][4] = 31;		// May
		calendar[0][5] = 30;		// June
		calendar[0][6] = 31;		// July
		calendar[0][7] = 31;		// August
		calendar[0][8] = 30;		// September
		calendar[0][9] = 31;		// October
		calendar[0][10] = 30;		// November
		calendar[0][11] = 31;		// December
		
		// How many days are there in a standard year without february?
		var days_sans_feb = (6*31) + (4*30);
		
		// Setup the first year.
		var total_days = days_sans_feb + calendar[0][1];
		
		for(var a = 1; a < settings.end_year - settings.start_year; a ++){
			calendar[a] = calendar[0];
			
			calendar[a][1] = daysInMonth(2, settings.start_year + a);
			
			total_days += days_sans_feb + calendar[0][1];
		}
		
		console.log('There are a total of ' + total_days + ' in the timeline');
		
		var timeline_view_day_width = 50;
		var timeline_view_month_width = timeline_view_day_width * 31;
		var timeline_view_year_width = timeline_view_month_width * 12;
		
		
		
		// Create Date Navgation/Label bar.
		
		var date_bar = $('<div id="date_bar">')
							.css({
								'position' : 'absolute',
								'left' : '250px'
							})
							.height(50)
							.width($(this).width() - 250)
							.appendTo($(this));
		
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
							
		var timeline_panel_width = calculate_period(end_year - start_year, settings.period_view)  * settings.period_view;
		var curr_x = 0;
		var curr_date = new Date(start_year * 1000);
		while(curr_x < timeline_panel_width){
			
			var time_graph_bar =  $('<div id="' + (curr_date.getTime() / 1000) + '" name="event">')
							.addClass('event')
							.css({
								'position' : 'absolute',
								'top' : 0 + 'px',
								'left' : (curr_x) + 'px'
							})
							.width(settings.period_view)
							.height(25)
							.html(curr_date.getDate() + ' ' + month_names[curr_date.getMonth()] + ' ' + curr_date.getFullYear() + ' ' + curr_date.getTime()/1000)
							.appendTo(time_graph);
			curr_x += settings.period_view;
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
					curr_date = new Date(curr_date.getFullYear() + 1, 0, 1);
					break;
			}
		}
		
		/*var zoom_out = $('<div>')
							.addClass('zoom_out')
							.click(function(e){
								zoom_multiplier -= 0.1;
								timeline_panel.css({
									'zoom' : zoom_multiplier,
									'-moz-transform' : 'scale(' + zoom_multiplier + ')'
								});
							})
							.appendTo(date_bar);*/
							
		// Create Category Details bar.
		
		var category_bar = $('<div id="category_bar">')
							.css({
								'position' : 'absolute',
								'top' : '50px'
							})
							.height($(this).height() - 50)
							.width(250)
							.appendTo($(this));
							
		var category_label = $('<span id="category_label">')
							.html('Category')
							.appendTo(category_bar);
		
		var timeline_container = $('<div id="timeline_container">')
							.css({
								'position' : 'absolute',
								'left' : '250px',
								'top' : '50px',
								'overflow' : 'scroll'
							})
							.height($(this).height() - 50)
							.width($(this).width() - 250)
							.scroll({'period_width' : period_width}, timeline_panel_scroll)
							.appendTo($(this));
		
		var timeline_panel_width = calculate_period(end_year - start_year, settings.period_view)  * settings.period_view;
		
		var timeline_panel = $('<div id="timeline_panel">')
							.css({
								'position' : 'absolute',
								'left' : '0px',
								'top' : '0px',
								'min-height' : $(this).height() - 50 + 'px'
							})
							.width(timeline_panel_width)
							.height(settings.category_count * 100)
							.mousemove({'settings' : settings, 'start_year' : start_year, 'month_names' : month_names}, update_date_bar)
							
							.appendTo(timeline_container);
							
		// Build timeline grid
		var first_cat;
		var category_counter = 0;
		$.each(settings.timeline_data, function(key,value){
			if(category_counter == 0){
				first_cat = value;
			}
		});
		var event_category = $('<div id="' + first_cat.id + '">')
							.addClass('event_category')
							.css({
								'position' : 'absolute',
								'top' : 0 + 'px',
								'left' : 0 + 'px',
								'overflow' : 'hidden'
							})
							.width(timeline_panel_width)
							.height(category_height)
							.appendTo(timeline_panel);
		
		
		
		var curr_x = 0;
		var curr_date = new Date(start_year * 1000);
		switch(settings.period_view){
			case view_type.month:
				curr_date = new Date(curr_date.getFullYear(), curr_date.getMonth(), 1);
				break;
			case view_type.year:
				curr_date = new Date(curr_date.getFullYear(), 0, 1);
				break;
		}
		
		while(curr_x < timeline_panel_width){
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
							.height(category_height)
							.width(settings.period_view)
							.html(curr_date.toDateString() + '&nbsp;' + (curr_date.getTime() / 1000))
							.appendTo(event_category);
				curr_x += settings.period_view;
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
						curr_date = new Date(curr_date.getFullYear() + 1, 0, 1);
						break;
				}
				console.log(curr_date.toDateString() + ' ' + curr_date.getTime());
		}
		
		category_counter = category_height;
		$.each(settings.timeline_data, function(key, value){
			event_category.clone()
							.attr({
								'id' : value.id
							})
							.css({
								'top' : category_counter + 'px'
							})
							.appendTo(timeline_panel)
			category_counter += category_height;
		});
		
		category_counter = 0;
		
		$.each(settings.timeline_data, function(key, category){
			$.each(category.events, function(event_key, event_obj){
				var d_date = new Date(event_obj.date * 1000);
				
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
				console.log('#' + category.id + ' #' + d_date.getTime() / 1000 + ' ' + d_date.toDateString());
				
				var event_div = $('#' + category.id + ' #' + event_obj.date);
				
				event_div.html('');
				var event_title = $('<div>')
							.addClass('event_title')
							.html(event_obj.title)
							.appendTo(event_div);
							
				var event_date = $('<div>')
							.addClass('event_date')
							.html(new Date(event_obj.date * 1000).toLocaleDateString())
							.appendTo(event_div);
							
				var event_image = $('<img>')
							.attr({
								'src' : event_obj.image
							})
							.appendTo(event_div);
			});
			category_counter++;
		});
	}
	
	function update_date_bar(e){
		console.log('mouse moved');
		var timeline_container = $('#timeline_container');
		var x = e.pageX + $('#timeline_container').scrollLeft() - timeline_container.offset().left;
		var y = e.pageY + $('#timeline_container').scrollTop() - timeline_container.offset().top;
		var curr_timestamp = (((((x / e.data.settings.period_view) * 60) * 60) * 24) + e.data.start_year) * 1000;
		var curr_date = new Date(curr_timestamp);
		$('#date_bar_day').html(curr_date.getDate());
		$('#date_bar_month').html(e.data.month_names[curr_date.getMonth()]);
		$('#date_bar_year').html(curr_date.getFullYear());
	}
	
	function timeline_panel_scroll(e){
		var timeline_container = $('#timeline_container');
		var time_graph = $('#time_graph');
		
		time_graph.scrollLeft(timeline_container.scrollLeft());
	}
	
	function calculate_period(x, period){
		var return_val = 0;
		switch(period){
			case view_type.day:
				return_val = Math.round(((x / 60) / 60) / 24);
				break;
			
			case view_type.month:
				return_val = Math.round(((((x / 60) / 60) / 24) / 365) * 12);
				console.log('There are ' + return_val + ' months.');
				break;
			
			case view_type.year:
				return_val = Math.round((((x / 60) / 60) / 24) / 365);
				break;
			default:
				console.log('A view type was not specified.');
		}
		
		return return_val;
	}
	
	function daysInMonth(month, year) {
		return new Date(year, month, 0).getDate();
	}
	
})(jQuery)