/*
	MediaCenterJS - A NodeJS based mediacenter solution
	
    Copyright (C) 2013 - Jan Smolders

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
(function($){

	var ns = 'mcjsm';
	var methods = {};

	function _init(options) {
		var opts = $.extend(true, {}, $.fn.mcjsm.defaults, options);
		return this.each(function() {
			var $that = $(this);
			var o = $.extend(true, {}, opts, $that.data(opts.datasetKey));
				
			// add data to the defaults (e.g. $node caches etc)	
			o = $.extend(true, o, { $that: $that, movielocation: undefined});
			
			// use extend(), so no o is used by value, not by reference
			$.data(this, ns, $.extend(true, {}, o));
			
			_carousel(o);
			
			$('ul.music').find('li').click(function(e) {
				e.preventDefault();	
				$(this).addClass('selected');
				var title = $(this).find('.title').html();
				_getAlbum(title)
			});
			
		});
	}
	
	/**** Start of custom functions ***/


	// Needs plugin jquery.carouFredSel-6.1.0-packed.js
	//TODO: handle long key press to scroll faster
	function _carousel(o){
		$('ul.music').find(".li:first").addClass("focused");
		$('ul.music').carouFredSel({
			auto: false,
			height:700, 
			onCreate: function( data ) {
				data.items.each(function() { 
					var title = $(this).find('.title').html();
					var visibleMovie = $(this);
					_handleVisibleMovies(o, title, visibleMovie);
				});
			},
			direction   : "up",
			scroll  : {
				onAfter : function( data ) {
					data.items.visible.each(function() { 
						var title = $(this).find('.title').html();
						var visibleMovie = $(this);
						_handleVisibleMovies(o, title, visibleMovie );
					});
				},
				fx : "scroll",
				easing  : "swing",
				items: 1
			},
			prev: {
				key : "left",
				button : "#prev"
			},
			next: {
				key : "right",
				button : "#next"
			},
			mousewheel: true,
			swipe: {
				onMouse: true,
				onTouch: true,
				fx : "scroll",
				easing  : "swing"
			}
		});
	}

	function _handleVisibleMovies(o, title, visibleMovie){
		console.log(title)
		$.ajax({
			url: '/music/post/', 
			type: 'post',
			data: {albumTitle : title}
		}).done(function(data){
			var albumData = $.parseJSON(data);
			visibleMovie.find("img").attr('src','');	
			visibleMovie.find("img").attr('src',albumData[0].thumb).addClass('coverfound');
		});
	}
	
	function _getAlbum(title){
		$.ajax({
			url: '/music/album/', 
			type: 'post',
			data: {album : title}
		}).done(function(data){
			$('#musicWrapper').hide();
			$('.backlink').attr('href','/music')
			$('body').append('<div id="tracklist"><h2>'+title+'</h2><ul id="tracks"></ul></div>')
			
			for (var i = 0; i < data.length; i++) {
				$('#tracks').append('<li>'+data[i]+'</li>')
			}	
			
			$('#tracklist').find('li').click(function(e) {
				console.log('play track')
				
				e.preventDefault();	
				var track = '/music/track/'+title+'/'+$(this).html();
				_playTrack(track,title)
			});
			
		});	
	}
	
	function _playTrack(track,title){
		if( $('#player').length) $('#player').remove();
		
		console.log('going to play track'+track)
		$.ajax({
			url: track, 
			type: 'get' 
		})

		$('body').append('<video id="player" class="video-js vjs-default-skin" style="position: absolute; bottom: 20px; left:0px width:300px; height:200px; z-index:9;" controls poster="/movies/img/loading-video.png" width="100%" height="100%"><source src="'+track+'" type="audio/ogg"></video>');
	}

	
	function _colorBackground(){
		//TODO: Color background according to albumArt
	}
	
	
	/**** End of custom functions ***/
	
	$.fn.mcjsm = function( method ) {
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || !method ) {
			return _init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.fn.mcjsm' );
		}
	};
	
	/* default values for this plugin */
	$.fn.mcjsm.defaults = {};

})(jQuery);