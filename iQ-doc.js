//HTML 5 file IO
//http://www.html5rocks.com/en/tutorials/file/dndfiles/


//File API
//http://www.w3.org/TR/FileAPI/#dfn-file
iQ_tax = function()
{   
    this.setProperties();
    this.bindEvents();
}

iQ_tax.prototype.setProperties = function(){
    this.jOutput = $('output');
    }

iQ_tax.prototype.bindEvents = function()
{

    $('form').on('change', 'input', $.proxy(this.selectedFiles, this));

    $('form').on(
        {'dragover': $.proxy(this.dragFiles, this),
        'drop':$.proxy(this.dropFiles, this)
    },
                    '.drag-drop-zone');


}

iQ_tax.prototype.selectedFiles = function(e)
{

    var jInput = $(e.target),
        files = e.target.files; // File object

        files.forEach(this.eachFile, this);

}

iQ_tax.prototype.eachFile = function(file, index, files)
{

    this.jOutput.append($('<dl>').append(
                            $('<dt>').html('Name: '),
                            $('<dd>').html(file.name), 
                            $('<dt>').html('Type: '),
                            $('<dd>').html(file.type), 
                            $('<dt>').html('Last modified: '),
                            $('<dd>').html(file.lastModifiedDate.toLocaleDateString()),
                            $('<dt>').html('Bytes: '),
                            $('<dd>').html(file.size),
                            $('<div>').addClass('clearfix')
                            )
                        );

}

iQ_tax.prototype.dragFiles = function(e)
{

    //https://developer.mozilla.org/en-US/docs/DragDrop/Drag_and_Drop

    //https://developer.mozilla.org/en-US/docs/DragDrop/DataTransfer
    e.stopPropagation();
    e.preventDefault();
    //https://bugs.webkit.org/show_bug.cgi?id=23695
    e.originalEvent.dataTransfer.dropEffect ='copy';
}

iQ_tax.prototype.dropFiles = function(e)
{
    e.stopPropagation();
    e.preventDefault();//Default behavior is opening the file
    var files = e.originalEvent.dataTransfer.files;

    files.forEach(this.eachFile, this);


}

//http://dev.w3.org/2006/webapi/FileAPI/#filereader-interface
iQ_tax.prototype_readFile = function()
{


}
iQ_tax.prototype.fileApiSupported = function()
{

    return (window.File && window.FileReader && window.Filedtst && window.Blob);
}

iQ_tax.prototype.Jsonify = function()
{


}

$(document).ready(function(){


    t = new iQ_tax();




})


