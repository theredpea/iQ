



//#region UTILITY_FUNCTIONS
function toNDigitString(i, n) {
    //I started with a switch statement
    //I started caling this, toFourDigitString
    //Better to make it flexible
    addZeroes = n - String(i).length;
    if (addZeroes > 0) {
        //Can't multiply strings like in Python, but this is pretty elegant
        return (Array(addZeroes+1).join("0") + String(i));
    }

    else {
        //How to throw an exception
        return i;
    }
}

//Used from here http://www.peterbe.com/plog/isint-function
function isInt(x) {
    if (x == 0) {
        return true;
    }
    
    var y=parseInt(x);
    if (isNaN(y)) return false;
    return x==y && x.toString()==y.toString();
}


//#endregion UTILITY_FUNCTIONS



//#region CORE_MODULES


FilterModule = function () { } // Why? Why not function ClickModule() {} That is how the constructor gets started here: http://joost.zeekat.nl/constructors-considered-mildly-confusing.html
//Good articles here
//    https://developer.mozilla.org/en-US/docs/JavaScript/Introduction_to_Object-Oriented_JavaScript
//and here
//     http://dmitrysoshnikov.com/ecmascript/chapter-7-2-oop-ecmascript-implementation/#prototype


FilterModule.prototype.init = function ($var_one, $var_two, $var_three) {
	

}


ClickModule = function () { }

ClickModule.prototype.init = function (loadM) {
    
    this.loadM = loadM;
    this.$iXbrl = $('#iXbrl');
    this.$xray = $('#xray');
    //$.proxy(this.pushpull, this)
    $('#pushpull').on('click', $.proxy(this.pushpull, this));

    //need a better option here?
    //Presumably divs are the only menu options inside of nav.
    /*$('nav').*/$('#menu').on('click', 'div', $.proxy(this.clickmenu, this));
    $('#xray').on('click', 'li.result', $.proxy(this.clickResult, this));
    $('#conceptGo').on('click', $.proxy(this.conceptGo, this)); // in this case, second parameter is data; it's not a selector
    //NOTE: Passing a data parameter with the val() of the input in the above .on() method would not work as expected; val() of input is most likely empty at this point; notice this is still the .init method of ClickModule

}


ClickModule.prototype.clickResult = function (e) {
    $e = $(e.currentTarget);
    i = $e.prevAll('li').length;
    this.scrollToLoc($(this.$currentResults[i]));

}

//TODO transfer to FilterModule, call it generic filter method; allow it to take an object; first property is its type, etc; type:'concept', contains:'true', results:'one' /* vs 'all' */, 


ClickModule.prototype.conceptGo = function (e) { //e is an eventObject
    //TODO: A better way to get the val();
    v= $('#concept').val();
    c = this.loadM.conceptNames
    //TODO: Make case-insensitive; case-insensitive for the conceptNames dictionary (aka "c"), case-insensitive for the "contains name attribute search"
    //TODO: Support both use-cases; I type "assets" and want every element that contains assets; I type "assets" and only want the element which is == assets
    //I could store lowercased versions of the keys into c, and then lowercase the string I was checking for... then use == or in; only question, are us-gaap:Cash and us-gaap:cash and us-gaap:CaSh, all different elements? I think they are considered the same element; hence different preferences (XHTML vs HTML5) for capitalization
    //Consider keyboard shortcut *

    if (typeof c != 'undefined') {
        if (v in c) {

            $cLocs = c[v];
        }

        else {
            //Contains
            $cLocs = $('[name*=' + v + ']');
        }
        //alert(' ' + $cLocs.length);

        //Need a method to 
        //1) get all the results ; create a list item in the new filter flyout which, when clicked, auto-scrolls to this location
        //1A) Scrolll to the first result
        //2) flyout the filter results list
        //2) Store all the css properties of the resultsso they can be returned to their pre-filtered state, later;
        //3) Save the details of this search in an extensible way; so a) it can also store queries like 'date >', 'date <', etc and b) It can be printed in an easy-to-remember-way. and possibly c) It can be cached in localStorage or serialized to share with others
        //5) Add it to a list of "Recent Searches", and  set it to the "Current search" back in the Search box.

        //TODO: Figure out how to convey "nesting"; understand use-cases; nonFractions can't be nested, textBlocks can be nested in each other, and nonFractions in those; identify the right iXBRL type
        //If nesting requires one-shade-darker-approach; consider using  this: http://stackoverflow.com/questions/5833624/increase-css-brightness-color-on-click-with-jquery-javascript
        //Or consider a simpler approach; use opacity
        $cLocs.css('background-color', '#CCFF66');
        this.$currentResults = $cLocs;
        this.addResultsSubMenu(e, $cLocs);
        $firstLoc = $cLocs.first(); // Naturally orders them top-to-bottom
        this.scrollToLoc($firstLoc);
       
    }
    else {
        alert('loadM conceptNames is type undefined ');
    }
}

ClickModule.prototype.scrollToLoc=function($loc)
{
    offset = $loc.offset()
    //window.scrollTo($offset.left, $offset.top); // http://www.w3schools.com/jsref/met_win_scrollto.asp
    //This would work, but I need to know which element's scrollTop I should be changing!
    $('html, body').animate({ scrollTop: offset.top }, 1000);
}
ClickModule.prototype.addResultsSubMenu = function (e, $results) {
    this.$subMenu = this.addSubMenu('results', $results);
    this.shrinkPrevMenus(this.$subMenu);
}

ClickModule.prototype.addSubMenu = function (c, $results) {
    $pushPull = this.$xray.children().last();
    /*Maybe just hide it instead of adding a new one?*/
    $resultsList = $('<div class="subMenu" style="width:0px; display:block;"></div>');
    $resultsList.addClass(c);
    $ul = $('<ul>');
    
    $results.each(function () {
        $ul.append('<li class="result">' + $(this).text() + '</li>');
    });
    $resultsList.append($ul);
    $pushPull.before($resultsList);
    $subMenu = this.$xray.children('.subMenu').last();
    
    $subMenu.animate({'width':'400px'}, 500);
    return $subMenu;
}
ClickModule.prototype.shrinkPrevMenus= function($beforeThisOne)
{
   
    $prevAll = $beforeThisOne.prevAll('.subMenu');
    //Why animate isn't working?
    /*$prevAll.animate({'width':'30px','overflow':'hidden','background-color':'rgb(50,50,50)'});
    */
    $prevAll.animate({ 'width': '0px' }, 500);

    /*
    $prevAll.css('display', 'none');
    */

}

ClickModule.prototype.pushpull = function (e) {
    e.preventDefault();
    e.stopPropagation();

    $push_pull = $(e.currentTarget)
    $remainingSubMenus = $push_pull.siblings('.subMenu');
    numRemaining = $remainingSubMenus.length;
    if (numRemaining > 1)
    {
        $lastSubMenu = $remainingSubMenus.last();
            
        $prevSubMenus = $remainingSubMenus.slice(0, -1);
   
        $prevSubMenus.animate({ 'width': '400px' }, 500);
        $lastSubMenu.animate({ 'width': '0px' }, 500, function () { this.remove(); });


    }

    else if (numRemaining == 1) {

        this.closeSubMenu(e);
        this.expandMenu(e);


    }


    else {
        $x_ray = $push_pull.siblings().first();
        //TODO: Give ClickModule a measure of the x_ray queried dynamically;
        //-parseInt($x_ray.css('left').slice(0,-2))==$x_ray.width()
        //var target = e.currentTarget
        if ($x_ray.css('margin-left') == '0px') {
            $x_ray.css('margin-left', '-128px');
            //$push_pull.text('&rarr;');
            $push_pull.text('');
            push_pull = $push_pull[0];
            $push_pull[0].innerHTML='>';
            // e.currentTarget.text('>');

        }
   

    else {
        $x_ray.css('margin-left', '0px');
        //$push_pull.text('&larr;');
        $push_pull.text('');
        $push_pull[0].innerHTML = '<';
        }
}
    
}


ClickModule.prototype.shrinkMenu = function (e) {
    t = $(e.currentTarget);
    p = t.parent();
    p.css('width', '60px');
    p.children().css('height', '60px');
    return this;




}

ClickModule.prototype.expandMenu = function (e) {
    t = $(e.currentTarget);
    p = t.siblings().first();
    p.css('width', '128px');
    p.children().css('height', '128px');




}

/*
ClickModule.prototype.convertPushToClose = function (e) {
    $t = $(e.currentTarget);
    //p = t.parent().parent(); //Should be #xray
    $push_pull = $t.parent().siblings().last(); //TODO 
    $push_pull.text('X');
    $push_pull.css('background-color', 'rgb(12, 235, 188)');
    $push_pull.off('click'); //read more here http://api.jquery.com/off/
    $push_pull.on('click', $.proxy(this.pushCloseSubmenu, this));



}*/

ClickModule.prototype.closeSubMenu = function (e) {
    
    //This closes a subMenu if it's already open.
    $subMenu = $(e.currentTarget).prev('.subMenu');
    if ($subMenu.length==1) {
       

        //Initially had this, silly:  $subMenu.after().attr('for');, I probably was trying to articulate the .next() method, but that was not necessary.
        id = $subMenu.attr('for');
        $menu = $('#' + id);
        //NOTE: If rapid-fire clicking on search, then share, then search, then share (click the second icon and it will revolve so you don't need to move the mouse)
        //Then this may not be able to hide and relocate the subMenu fast enough
        //$subMenu.css('width', '0px');
        $subMenu.hide(500, function () { $menu.append(this); });
       //$prev.css('display', 'none');//
        //TODO: Consider making this a method; it is also used to return the non-clicked CloseSubmenu's back to their parent color (off the focus color)
        $menu.css('background-color', $menu.parent().css('background-color'));
    }
}

ClickModule.prototype.pushCloseSubmenu = function (e) {
    e.preventDefault();
    e.stopPropagation();
    $push_pull = $(e.currentTarget)
    $x_ray = $push_pull.siblings().first();

    this.closeSubMenu(e);

    $menu.css('background-color', $menu.parent().css('background-color'));
    this.convertCloseToPush(e);
    this.expandMenu(e);


}

//TODO: Actually nice to use the &lt; or &laquo; sign the whole time; no need to convert it to an "X"; no need to distinguish between close and push?
ClickModule.prototype.convertCloseToPush = function (e) {
    $push_pull = $(e.currentTarget);
    //p = t.parent().parent(); //Should be #xray

    $push_pull.text('&laquo;');
    $push_pull.css('background-color', 'rgb(128, 128, 128)');
    $push_pull.off('click'); //read more here http://api.jquery.com/off/
    $push_pull.on('click', $.proxy(this.pushpull, this));



}


ClickModule.prototype.selectMenu = function (e) {
    //Some generic function which will .parent().prepend()
    //nav.menu >div
    $menu = $(e.currentTarget);
    //Reset the others
    $menu.siblings().css('background-color', $menu.parent().css('background-color'));
    $p = $menu.parent();
    $p.prepend($menu);
    $menu.css('background-color', 'rgb(128,128,128)'); //animate({ 'background-color': 'rgb(128,128,128)' }, 200);




}


ClickModule.prototype.initMenuItem = function (e) {
    this.selectMenu(e);


    this.shrinkMenu(e);
    this.closeSubMenu(e);

    this.expandSubMenuItems(e);

}

ClickModule.prototype.expandSubMenuItems = function (e) {
    $t = $(e.currentTarget);
    $sub = $('.subMenu', $t);

    //TODO: Fix, fragile? Just reference #pushpull directly
    $t.parent().siblings().last().before($sub);
    $sub.show('fast');

}
ClickModule.prototype.initSearch = function (e) {
    //TODO If Not Shrunk
   
    this.initMenuItem(e);

}

ClickModule.prototype.initShare = function (e) {
    this.initMenuItem(e);
}

ClickModule.prototype.initStats = function (e) {

    this.initMenuItem(e);
}

ClickModule.prototype.clickmenu = function (e) {

    //alert('clickedMenu');
    $menu_div = $(e.currentTarget)
    var clickedItem = $menu_div.attr('id');

    var menu = {
        'search': $.proxy(this.initSearch, this),
        'share': $.proxy(this.initShare,this),
        'stats': $.proxy(this.initStats,this)
    }

   menu[clickedItem](e);

    

}




LoadModule = function () { }

LoadModule.prototype.init = function () {


}

LoadModule.prototype.loadiXbrl = function (sel, url, concepts) {

    this.$sel = $(sel)
    this.$load = $('.loading', this.$sel);
    this.$conceptList = $(concepts);
    this.$content = $('.content', this.$sel);
    this.showLoading();
    
    /*Preparation keeps the .loader spinning while meaningful stuff is cached; consider using Promise-chaining and do more loading in the background, and only make them wait if they want the metadata that is still being loaded */ 

    /*this.loadConceptMetadata /*Get labels, dictionaries, references, usage stats, of those elements 
    this.getCalendars
    this.*/
    
    this.$content.load(url, $.proxy(this.loadMetadata, this)); //Id on't think the callback function can take arguments other than those specified here: http://api.jquery.com/load/ Only in callback function should I do all the rest...
    
    //I skipped
    //http://stackoverflow.com/questions/9327218/access-control-allow-origin-not-allowed-by
    //Cannot cross-origin requests; JSONP allows it using <script>, not subject to cross-origin rules (?)
    //And a GET URL, which provides a callback parameter, which should be the name function in the Javascript from the other domain(?)
    //And the rest of the parameters are aribtrary arguments which will be used on that function in the other domain (?)
    //http://jeremy.org/misc/jsonp.html
}

/*This is a callback function; prepare it to take the three parameters described here:*/
LoadModule.prototype.loadMetadata = function (response, status, xhr) {
    conceptNames = this.getConcepts(this.$content);
    var o;
 
    for(var n in conceptNames)
    {
        o+="<option value=\"" + n + "\" />\n"
    }
    $o = $(o);
    this.$conceptList.append($o);

    this.hideLoading();

    //TODO: Parse calendars, Members, load definitions, references, etc.

    this.$content.show();
}
LoadModule.prototype.getConcepts = function ($iXbrl)

{
   
    var conceptNames = {}

    //http://api.jquery.com/jQuery.each/
    //http://api.jquery.com/category/selectors/?rdfrom=http%3A%2F%2Fdocs.jquery.com%2Fmw%2Findex.php%3Ftitle%3DSelectors%26redirect%3Dno#Special_characters_in_selectors
    //Must escape the colon qualifier for namespace.
    var count = 0;
    //TODO: Handle some errors that might occur
    //TODO: Better way to identifier ix elements?
    //xbrl.ix.base.class xs:group name
    //http://www.xbrl.org/2008/inlineXBRL/xhtml-inlinexbrl-1_0-definitions.xsd

    var xbrl_ix_base_class = ['footnote',
                                'fraction',
                                'nonFraction',
                                'numerator',
                                'denominator',
                                'nonNumeric',
                                'tuple'
    ];

    var j_ixbrl_base = $('ix\\:nonFraction');

    $.each(xbrl_ix_base_class, function (i, value) { j_ixbrl_base.add($('ix\\:' + value)) });

    alert(j_ixbrl_base.length);

    $('ix\\:nonFraction').each( 
        function (i) {
            count++;
            //this becomes the DOM element
            var pName = $(this).attr('name');

            //TODO: Split this into a function, more robust, if not namespace-qualified
            //TODO: Figure out how to track the namespace
           
            
            name = pName.slice(pName.indexOf(':') + 1);
            if (name == undefined) {
                alert($(this).prop("tagName"));
            }
            if (name) {


                //TODO:Check if this can be any shorter
                //TODO: Decide whether to pack arrays of jQuery objects /DOM Elements (note a DOM Element Array can be turned into a jQuery array) or a collection of jQuery objects using the name
                jApp = true;
                if(jApp && !(name in conceptNames))
                {
                    conceptNames[name] = $('[name="' + pName + '"]');
                }
                else{
                    if (name in conceptNames) {

                        conceptNames[name].push($(this));
                    }
                    else {
                        conceptNames[name] = [];
                        conceptNames[name].push($(this));
                    }
                }
            }
            }   
        );
    //alert('getting concepts'+conceptNames.length);
    //alert(count);
    //TODO: Weird to set an instance variable *and* return ? Consider a "try" method; which sets a variable by reference and returns true if operation succeeded
    this.conceptNames = conceptNames;
    return conceptNames;
}
LoadModule.prototype.showLoading = function () {
  
    this.$load.show();
    this.$load.append('<img src="/images/loading.png">');
}

LoadModule.prototype.hideLoading = function () {
    //Not necessary when I $sel.load ($sel = $('#iXbrl') directly; this kicks out the loading div which was there
    this.$load.empty();
    this.$load.hide();
}



$(document).ready(function () {
 

    loadM = new LoadModule();
    loadM.loadiXbrl('#iXbrl', "iXBRL/massive.html", '#concepts');
    new ClickModule().init(loadM);

    });

  



