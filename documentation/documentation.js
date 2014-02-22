//HTML 5 file IO
//http://www.html5rocks.com/en/tutorials/file/dndfiles/


//File API
//http://www.w3.org/TR/FileAPI/#dfn-file
iQ_home = function()
{   
    this.setProperties();
    this.bindEvents();
}

iQ_home.prototype.setProperties = function(){
    $('body').on('click', 'nav a', $.proxy(this.click_nav, this));
    }

iQ_home.prototype.click_nav = function(e)
{



}

iQ_home.prototype.bindEvents = function()
{

    $('form').on('change', 'input', $.proxy(this.selectedFiles, this));

    $('form').on(
        {'dragover': $.proxy(this.dragFiles, this),
        'drop':$.proxy(this.dropFiles, this)
    },
                    '.drag-drop-zone');


}


$(document).ready(function(){


    t = new iQ_home();




})


