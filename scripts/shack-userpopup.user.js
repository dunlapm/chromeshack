// ==UserScript==
// @name Shacknews: User Popup
// @namespace http://www.lmnopc.com/greasemonkey/
// @description Adds dropdown menus to users
// @include http://shacknews.com/*
// @include http://www.shacknews.com/*
// @match http://shacknews.com/*
// @match http://www.shacknews.com/*
// @exclude http://www.shacknews.com/frame_chatty.x*
// @exclude http://bananas.shacknews.com/*
// @exclude http://*.gmodules.com/*
// @exclude http://*.facebook.com/*
// ==/UserScript==
/*
	Shack: User Popup
	(ↄ)2011 Thom Wetzel
		
	This is the user menu stuff stripped out of the [lol] Greasemonkey script
	
	DO *NOT* RUN ALONG WITH THE CURRENT REVISION OF THE [LOL] SCRIPT UNLESS
	YOU LIKE YOUR SHIT FUCKED UP ALL OVER THE PLACE.
	
	2011-04-26
		* First stab at profiles   

*/
(function() {

	// grab start time of script
	var benchmarkTimer = null;
	var scriptStartTime = getTime();

	function tw_log(str) { GM_log(str); }
	function getTime() { benchmarkTimer = new Date(); return benchmarkTimer.getTime(); }

	// Library functions 
	if (typeof(GM_log) == 'undefined') { GM_log = function(message) { console.log(message); } }
	if (typeof(GM_addStyle) == 'undefined') { GM_addStyle = function(css) { var style = document.createElement('style'); style.textContent = css; document.getElementsByTagName('head')[0].appendChild(style); } }
	function getElementByClassName(oElm, strTagName, strClassName) { try { var arrElements = oElm.getElementsByTagName(strTagName); for(var i=0; i < arrElements.length; i++) { if (arrElements[i].className.indexOf(strClassName) == 0) { return arrElements[i]; } } } catch (ex) { return null; } }
	function stripHtml(html) { return String(html).replace(/(<([^>]+)>)/ig, ''); }
	function trim(str) { return String(str).replace(/^\s+|\s+$/g,""); }
	function removeClassName(obj, className) { var a = obj.className.split(' '); var i = a.indexOf(className); if (i != -1) { a.splice(i, 1); }obj.className = a.join(' '); }
	function addCommas(nStr) { nStr += ''; x = nStr.split('.'); x1 = x[0]; x2 = x.length > 1 ? '.' + x[1] : ''; var rgx = /(\d+)(\d{3})/; while (rgx.test(x1)) { x1 = x1.replace(rgx, '$1' + ',' + '$2'); } return x1 + x2; }

	function isLoggedIn()
	{
		return document.getElementById('user_posts') != null;
	}

    function getShackUsername()
    {
		return document.getElementById('user_posts').innerHTML;
	}

	GM_addStyle(
		''
		+ 'header > div.in { overflow: visible; }'
		+ '.social { display: none; }'
		+ 'div#account-links { width: 300px !important; }'
		+ 'header a.button.inbox { width: 50px !important; }'
		+ 'header a.button.settings { width: 60px !important; }'
		+ '.userDropdownButton { background: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB3aWR0aD0iNTEycHgiIGhlaWdodD0iNTEycHgiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1MTIgNTEyIiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8cGF0aCBkPSJNMjU4Ljc0NCwyOTMuMjE0YzcwLjg5NSwwLDEyOC4zNjUtNTcuNDcyLDEyOC4zNjUtMTI4LjM2NmMwLTcwLjg5Ni01Ny40NzMtMTI4LjM2Ny0xMjguMzY1LTEyOC4zNjcKCQljLTcwLjg5NiwwLTEyOC4zNjgsNTcuNDcyLTEyOC4zNjgsMTI4LjM2N0MxMzAuMzc3LDIzNS43NDIsMTg3Ljg0OCwyOTMuMjE0LDI1OC43NDQsMjkzLjIxNHoiLz4KCTxwYXRoIGQ9Ik0zNzEuNTMzLDMyMi40MzJIMTQwLjQ2N2MtNzcuNTc3LDAtMTQwLjQ2Niw2Mi45MDktMTQwLjQ2NiwxNDAuNDg3djEyLjYwMWg1MTJ2LTEyLjYwMQoJCUM1MTIsMzg1LjM0MSw0NDkuMTEyLDMyMi40MzIsMzcxLjUzMywzMjIuNDMyeiIvPgo8L2c+Cjwvc3ZnPgo=) '
		+ '     6px 50% / 10px no-repeat; width: 35px; }'
		+ 'header.mini .menu-content.hide #account-links .userDropdownButton { border: 1px solid black !important; }'
		+ '.userDropdown.hidden { display: none; }'
		+ 'span.author { position: relative !important; }'
		+ 'a.button.inbox.on { width: 70px !important; }'

		+ 'div.threads ul ul span.author ul { margin-left: 0; background-image: none; bottom: auto; }'
		+ 'div.threads ul ul li span.author li { padding-left: 0; background-image: none; }'

		+ '.userDropdown { position: absolute !important; width: auto !important; background: #222 !important; z-index: 9999; text-align: left; border: 1px solid #333; -moz-box-shadow: 3px 3px 4px #000; font-weight: normal; font-size: 12px; padding: 0 !important; }'
		+ '.menu-content.hide #account-links .userDropdownButton .userDropdown { top: 20px; right: 21px; }'
		+ 'header.mini .menu-content.hide #account-links .userDropdownButton .userDropdown { top: 60px; right: 75px; }'
		+ '.user a .userDropdown { top: 1.5em; left: 0; }'
		+ '.userDropdown li { background-color: inherit; margin: 0; padding: 0 !important; background-image: none !important;  display: block !important; width: 100% !important; line-height: 2.5em; border-bottom: 1px solid #333 !important; z-index: 9999; }'
		+ '.userDropdown li.userDropdown-separator { border-bottom: 1px solid #666 !important; }'
		+ '.userDropdown li a { display: block; width: auto !important; white-space: nowrap; padding: 4px 12px !important; margin: 0 !important; color: #ddd !important; font-weight: normal !important; font-size: 12px !important; font-family: "Open Sans", sans-serif; border: 0 !important;  border-radius: 0 !important; background-color: transparent !important; }'
		+ '.userDropdown li a:hover { color: #fff; background-color: #524A60 !important; }'
		+ '#lolWorkingBar { position: fixed; left: 0; bottom: 0; height: 2.5em; width: 100%; line-height: 2.5em; background-color: #000; color: #fff; font-size: 150%; font-weight: bold; display: none; text-align: center; }'

		// Some responsive tweaks so it doesn't look bad at smaller widths
		+ '@media (max-width: 1023px) {'
		+ '    .menu-content.hide #account-links .userDropdownButton .userDropdown { right: 11px; }'
		+ '    header.mini .menu-content.hide #account-links .userDropdownButton .userDropdown { right: 110px; }'
		+ '    header.mini a.button.inbox { width: 30px !important; }'
		+ '    header.mini a.button.settings { width: 30px !important; }'
		+ '    header.mini .menu-content.hide #account-links .userDropdownButton { overflow: hidden; } '
		+ '}'

		+ '@media (max-width: 767px) {'
		+ '    .menu-content.hide #account-links .userDropdownButton .userDropdown { top: 295px; right: 21px; }'
		+ '}'

	);
	
	function createTextWrapper(tag, text, url)
	{	
		var ret = document.createElement(tag);
		
		if (text == null) 
		{
			ret.innerHTML = '&nbsp;'; 
		}
		else if (text.length == 0)
		{
			ret.innerHTML = '&nbsp;'; 
		}
		else
		{
			if (url != null)
			{
				if (url.length)
				{
					var a = document.createElement('a'); 
					a.href = url;
					a.target = '_blank'; 
					
					a.appendChild(document.createTextNode(text)); 
					
					ret.appendChild(a); 
				}			
			}
			else
			{
				ret.appendChild(document.createTextNode(text));
			}
		} 
		return ret;  
	}
	
	function drawProfile(data)
	{
		username = data['data']['username']; 
	
		pDiv = document.createElement('div'); 
		pDiv.className = 'tw-profile';
		
		pDiv.appendChild(createTextWrapper('h2', username));

		// Create General panel		
		pnl = document.createElement('div');
		pnl.className = 'tw-panel'; 
		
		pnl.appendChild(createTextWrapper('h3', 'General'));
		
		dl = document.createElement('dl');
		
		dl.appendChild(createTextWrapper('dt', 'Age'));  
		dl.appendChild(createTextWrapper('dd', data['data']['age'])); 
		
		dl.appendChild(createTextWrapper('dt', 'Location'));  
		dl.appendChild(createTextWrapper('dd', data['data']['location']));
		
		dl.appendChild(createTextWrapper('dt', 'Gender'));  
		dl.appendChild(createTextWrapper('dd', data['data']['gender']));
		
		dl.appendChild(createTextWrapper('dt', username + '\'s Posts', 'http://www.shacknews.com/user/' + username + '/posts')); 

		var actualUser = '&user=' + encodeURIComponent(getShackUsername());
		dl.appendChild(createTextWrapper('dt', '[lol]: Shit ' + username + ' Wrote', 'http://lmnopc.com/greasemonkey/shacklol/user.php?authoredby=' + username + actualUser));
		
		// Create menu item for reading post count
		var aPostCount = document.createElement('a');
		aPostCount.appendChild(document.createTextNode('Get Post Count'));
		aPostCount.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); getPostCount(username) }, false);  
		dt = document.createElement('dt');
		dt.appendChild(aPostCount); 
		dl.appendChild(dt); 
				
		pnl.appendChild(dl); 
		
		pDiv.appendChild(pnl); 
		
		// Create Accounts panel
		pnl = document.createElement('div');
		pnl.className = 'tw-panel'; 
		
		pnl.appendChild(createTextWrapper('h3', 'Accounts'));
		
		dl = document.createElement('dl');
		
		accounts = data['data']['services'];
		if (accounts != null)
		{ 
			for (i = 0, ii = accounts.length; i < ii; i++)
			{
				dl.appendChild(createTextWrapper('dt', accounts[i]['service']));  
				dl.appendChild(createTextWrapper('dd', accounts[i]['user'])); 
			}
		}
		
		pnl.appendChild(dl);
		
		pDiv.appendChild(pnl);
		
		// Create About panel
		pnl = document.createElement('div');
		pnl.className = 'tw-panel'; 
		
		pnl.appendChild(createTextWrapper('h3', 'About'));
		pnl.appendChild(createTextWrapper('div', data['data']['about']));
		
		pDiv.appendChild(pnl);
		
		// Add close button
		btn = document.createElement('div'); 
		btn.className = 'tw-close';
		btn.appendChild(document.createTextNode('CLOSE'));
		btn.setAttribute('title', 'Close Profile'); 
		btn.addEventListener('click', function(e) { e.target.parentNode.style.display = 'none'; }, false);
		
		pDiv.appendChild(btn);  
		
		// Add profile to page
		document.getElementsByTagName('body')[0].appendChild(pDiv); 
	}
	
	function displayProfile(username)
	{
		// Scrub username
		username = trim(stripHtml(username));
	
		// Display working... message		
		displayWorkingBar('Retrieving profile data for ' + username + '...'); 
	
		// 
		var addr = 'http://gamewith.us/_widgets/shack-profile-popup.php?user=' + encodeURIComponent(username); 
        console.log(addr);
		
		// use xmlhttpRequest to post the data
        getUrl(addr, function(response) {
				
				hideWorkingBar();
				
				var data = null; 
				
				try 
				{
					data = JSON.parse(response.responseText);  
				}
				catch (ex)
				{
					alert('Profile retrieval failed: ' + ex.message);
					return;  
				}
				
				if (data['status'] == '0')
				{
					alert(data['message']); 
					return;
				} 
				
				drawProfile(data); 
			}
	  	);
	}
	
	function displayWorkingBar(message)
	{
		var workingBar = document.getElementById('lolWorkingBar');
		
		// Create #lolWorkingBar if it doesn't already exist  	
		if (workingBar == null)
		{
			workingBar = document.createElement('div');
			workingBar.id = 'lolWorkingBar'; 
			
			document.getElementsByTagName('body')[0].appendChild(workingBar);
			
		}
		else
		{
			// Remove child nodes (presumably prior messages) 
			while (workingBar.firstChild != null) 
			{ 
				workingBar.removeChild(workingBar.firstChild); 
			}
		}
		
		// Create message (using createTextNode for proper escaping) 
		workingBar.appendChild(document.createTextNode(message)); 
		
		// Make it visible 
		workingBar.style.display = 'block';   
	}
	
	function hideWorkingBar()
	{
		var workingBar = document.getElementById('lolWorkingBar');
		if (workingBar)
		{
			workingBar.style.display = 'none'; 
		}
	}
	
	function getPostCount(username)
	{
		// Display working... message		
		displayWorkingBar('Retrieving post count for ' + username + '...'); 
	
		// 
		var addr = 'http://shackapi.stonedonkey.com/postcount/' + encodeURIComponent(username) + '.json'
        console.log(addr);
		
		// use xmlhttpRequest to post the data
        getUrl(addr, function(response) {
				
				hideWorkingBar();
				
				var postCount = JSON.parse(response.responseText);
				
				alert(postCount['user'] + ' has ' + addCommas(postCount['count']) + ' posts');
			}
	  	);
	}

	function createListItem(text, url, className, target)
	{
		var a = document.createElement('a');
		a.href = url; 
		if (typeof(target) != 'undefined') { a.target = target; }
		a.appendChild(document.createTextNode(text)); 
	
		var li = document.createElement('li');
		if (typeof(className) != 'undefined') { li.className = className; } 

		// Prevent menu clicks from bubbling up 
		a.addEventListener('click', function(e) { e.stopPropagation(); }, false);
		
		li.appendChild(a); 
		
		return li; 
	}

	function displayUserMenu(parentObj, username, friendlyName)
	{
		// Create the dropdown menu if it doesn't already exist 
		ulUserDD = getElementByClassName(parentObj, 'ul', 'userDropdown'); 
		if (ulUserDD == null)
		{
			// Create UL that will house the dropdown menu 
			var ulUser = document.createElement('ul'); 
			ulUser.className = 'userDropdown';
	
			// Scrub username
			username = encodeURIComponent(trim(stripHtml(username)));
			
			if (friendlyName == 'You')
			{
				your = 'Your';
				vanitySearch = 'Vanity Search';
				parentAuthor = 'Parent Author Search';  
			}
			else
			{
				your = friendlyName + '\'s'; 
				vanitySearch = 'Search for "' + friendlyName + '"'; 
				parentAuthor = friendlyName + ': Parent Author Search'; 
			}
		
			// Create menu items and add them to ulUser
			var postsUrl = getSetting("enabled_scripts").contains("use_winchatty_search") 
				? 'https://winchatty.com/nusearch?a=' + username
				: 'http://www.shacknews.com/user/' + username + '/posts';
			ulUser.appendChild(createListItem(your + ' Posts', postsUrl));

			var vanityUrl = getSetting("enabled_scripts").contains("use_winchatty_search") 
				? 'https://winchatty.com/nusearch?q=' + username
				: 'http://www.shacknews.com/search?chatty=1&type=4&chatty_term=' + username + '&chatty_user=&chatty_author=&chatty_filter=all&result_sort=postdate_desc';
			ulUser.appendChild(createListItem(vanitySearch, vanityUrl));

			var repliesUrl = getSetting("enabled_scripts").contains("use_winchatty_search") 
				? 'https://winchatty.com/nusearch?pa=' + username
				: 'http://www.shacknews.com/search?chatty=1&type=4&chatty_term=&chatty_user=&chatty_author=' + username + '&chatty_filter=all&result_sort=postdate_desc';
			ulUser.appendChild(createListItem(parentAuthor, repliesUrl, 'userDropdown-separator'));

			// Include reference to person actually sitting behind the keyboard in all links to lol page
			var actualUser = '&user=' + encodeURIComponent(getShackUsername());

			ulUser.appendChild(createListItem('[lol] : Shit ' + friendlyName + ' Wrote', 'http://lmnopc.com/greasemonkey/shacklol/user.php?authoredby=' + username + actualUser, 'userDropdown-lol'));
			ulUser.appendChild(createListItem('[lol] : Shit ' + friendlyName + ' [lol]\'d', 'http://lmnopc.com/greasemonkey/shacklol/user.php?loldby=' + username + actualUser, 'userDropdown-lol')); 		
			ulUser.appendChild(createListItem('[lol] : Shit ' + friendlyName + ' [inf]\'d', 'http://lmnopc.com/greasemonkey/shacklol/user.php?tag=inf&loldby=' + username + actualUser, 'userDropdown-lol'));
			ulUser.appendChild(createListItem('[lol] : Shit ' + friendlyName + ' [tag]\'d', 'http://lmnopc.com/greasemonkey/shacklol/user.php?tag=tag&loldby=' + username + actualUser, 'userDropdown-lol'));
			ulUser.appendChild(createListItem('[lol] : Shit ' + friendlyName + ' [unf]\'d', 'http://lmnopc.com/greasemonkey/shacklol/user.php?tag=unf&loldby=' + username + actualUser, 'userDropdown-lol'));
			ulUser.appendChild(createListItem('[lol] : ' + your + ' Fan Train', 'http://lmnopc.com/greasemonkey/shacklol/user.php?fanclub=' + username + actualUser, 'userDropdown-lol userDropdown-separator'));
			
			// Create menu item for reading post count
			var aPostCount = document.createElement('a');
			aPostCount.appendChild(document.createTextNode('Get ' + your + ' Post Count'));
			aPostCount.addEventListener('click', function(e) { e.preventDefault(); e.stopPropagation(); getPostCount(username) }, false);  
			var liPostCount = document.createElement('li');
			liPostCount.appendChild(aPostCount);
			ulUser.appendChild(liPostCount); 
			
			// Add ulUser to the page
			parentObj.appendChild(ulUser);
		}
		else // ulUserDD already exists -- this just handles the toggling of its display 
		{
			// Toggle ulUser's classname
			if (ulUserDD.className.split(' ').indexOf('hidden') == -1)
			{
				ulUserDD.className += ' hidden'; 
			}
			else
			{
				removeClassName(ulUserDD, 'hidden'); 
			}
		} 
	}

	// Add catch-all event handlers for creating user dropdown menus 
	document.addEventListener('click', function(e)
	{
		var t = e.target; 
		var p = t.parentNode;
		var pp = p.parentNode;
		var ppp = pp.parentNode;
		
		// Post author clicked 
		if ((t.tagName == 'A') && (p.tagName == 'SPAN') && (p.className == 'user'))
		{
			e.preventDefault();
			e.stopPropagation();

			/*			
			if (navigator.userAgent.indexOf('Firefox') !== -1)
			{
				displayProfile(t.innerHTML);
			}
			else
			{
				displayUserMenu(t, t.innerHTML, t.innerHTML);
			}
			*/
			displayUserMenu(t, t.innerHTML, t.innerHTML);
		}
		
		// User name clicked (at the top of the banner?)
		else if (t.id == 'userDropdownTrigger')
		{
			e.preventDefault();
			e.stopPropagation();

			displayUserMenu(t, getShackUsername(), 'You');
		}
		
		// OWN user name clicked as post author
		else if ((t.tagName == 'A') && (p.tagName == 'SPAN') && (p.className == 'user this-user'))
		{
			e.preventDefault();
			e.stopPropagation();

			/*
			if (navigator.userAgent.indexOf('Firefox') !== -1)
			{
				displayProfile(t.innerHTML);
			}
			else
			{ 
				displayUserMenu(t, t.innerHTML, 'You');
			}
			*/
			displayUserMenu(t, t.innerHTML, 'You');
		}
		else {

			var parentDropdown = e.target;
			while (Object.prototype.toString.call(parentDropdown) != "[object HTMLDocument]") {
				if (parentDropdown.className.split(' ').indexOf('userDropdown') > -1) {
					parentDropdown.className += ' hidden';
					break;
				}
				parentDropdown = parentDropdown.parentNode;
			}
		}

	}, false); 

	if (isLoggedIn())
	{
	    // Add the button to the account links area, which is visible in both incarnations of the top bar.
	    var accountLinks = document.getElementById('account-links');
	    var aUser = document.createElement('a');
	    aUser.setAttribute('id', 'userDropdownTrigger');
	    aUser.className = 'button userDropdownButton';
	    aUser.innerHTML = 'me';
	    accountLinks.appendChild(aUser);
	}

	// log execution time
	tw_log(location.href + ' / ' + (getTime() - scriptStartTime) + 'ms');
	
})();
