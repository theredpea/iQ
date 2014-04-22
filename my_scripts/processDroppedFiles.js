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
    this.xsdReader = new FileReader();
    this.xsdReader.onload = $.proxy(this.tableify, this);
    this.ixbrlReader = new FileReader();
    this.jsonSchemas = {};
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

iQ_tax.prototype.fileOnload = function(e)
{

    e.target.result;

}

iQ_tax.prototype.selectedFiles = function(e)
{
    //  http://www.html5rocks.com/en/tutorials/file/dndfiles/

    var jInput = $(e.target),
        files = e.target.files; // File object

        files.forEach(this.listEachFile, this);

}

iQ_tax.prototype.listEachFile = function(file, index, files)
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

    files.forEach(this.readFile, this);


}

//http://dev.w3.org/2006/webapi/FileAPI/#filereader-interface
//https://developer.mozilla.org/en-US/docs/DOM/FileReader
//http://www.html5rocks.com/en/tutorials/file/dndfiles/

iQ_tax.prototype.readFile = function(file, index, files)
{

    var theFileNamed = "The file named \"" + file.name + "\"";
    var withExtension = "with extension " + file.name.extension();

    switch(file.type){

        case 'application/xml':
            //Switch the XML
            switch(file.name.extension())
            {

                case 'xsd':  
                    //https://developer.mozilla.org/en-US/docs/Web/API/FileReader
                    //readAsText, vs readAsArrayBuffer, or readAsBinaryString, or readAsDataURL
                    this.xsdReader.readAsText(file);
                    break;
                case 'xml':
                    alert(theFileNamed+" has a \"xml\" extension. Taxonomies (aka Schemas) typically have a \"xsd\" extension. iQ can only process .xsd for now.");
                    break;


            }
            break;
        default:
            alert("iQ does not recognize the file extension of " + theFileNamed);


    }
  
}


iQ_tax.prototype.fileApiSupported = function()
{

    return (window.File && window.FileReader && window.Filedtst && window.Blob);
}

iQ_tax.prototype.tableify = function(event)
{

    var jsonSchema = this.jsonify(event),
        jTable = $('<table></table>'),
        jHead = $('<thead></thead>'),
        jBody = $('<tbody></tbody>'),
        jHeaderCells=[],
        jRows=[];

    var i=0,
        elementAttributes=[];
    for (elementName in jsonSchema)
    {
        var jRow=$('<tr></tr>'),
        jCells=[],
        elementObject=jsonSchema[elementName];
        
        if(i==0) elementAttributes = Object.keys(elementObject);

        elementAttributes.forEach(function(elementAttribute, index, array)
            {
                if(i==0)
                {

                    jHeaderCells.push($('<th></th>').text(elementAttribute));
                }

                text = elementObject[elementAttribute] || 'N/A';
                jCells.push($('<td></td>').text(text));

            }
        );

        jRow.append(jCells)
        jRows.push(jRow);
        i++;
        if (i>500) break;
    }

    jBody.append(jRows);
    jHead.append($('<tr></tr>').append(jHeaderCells));
    jTable.append(
        jHead,
        jBody);

    $('body').append(jTable);
    return jTable;


}


iQ_tax.prototype.jsonify = function(event)
{

    //TODO: Don't assume they use 'xs', they may use 'xsd', or nothing at all.

    //TODO: Consider slicing bytes
    var jDoc = $(event.target.result);
    
    var rootElement = jDoc.filter(function(i,e)
                            {
                                return e.tagName? true: false;
                            })[0];
    var attributes = rootElement.attributes;
    var prefixForXsd = '';

    for(i=0; i<attributes.length; i++)
    {
        var name=attributes[i].name;
        if (attributes[i].value.indexOf('http://www.w3.org/2001/XMLSchema')>-1) { prefixForXsd = name.slice(name.indexOf(':')+1); break; }

    }




    var dSchema = jDoc.toArray().filter(function(element, index, array){
        //var isElementObject = (element.constructor.prototype == document.createElement('unknownElement').constructor.prototype);
        var isElementObject = element.tagName ? true : false;

        var isSchemaNamed = function() {
            if (!isElementObject) return false;
            var tName = element.tagName.toLowerCase();
            var isQualified = tName==prefixForXsd+':schema' || tName.indexOf('schema')>-1;
            var isLocal = tName == 'schema';

            return (isQualified || isLocal);
        };

            //console.log(element.tagName + ' isElementObject: ' + isElementObject + ', isSchemaNamed: ' + isSchemaNamed());

            return(isElementObject && isSchemaNamed());
    });

    jSchema = $(dSchema);

    var jElements = jSchema.find(ns(prefixForXsd+'\\:element')),
    sNamespaceUrl = jSchema.attr('targetNamespace'), 
    jsonSchema = {};


    //Consider native forEach here
    jElements.each(function(index, value)
    {

        jElement = $(value);
        //value.attributes
        //value.attributes.constructor.prototype==NamedNodeNap()
        var oAttributes={};
        for (attributeIndex in value.attributes)
        {
            attribute = value.attributes[attributeIndex];
            if(attribute.name!=undefined && !isNaN(parseInt(attributeIndex))) oAttributes[attribute.name]=attribute.value;
        }

        jsonSchema[jElement.attr('name')] = oAttributes;
        //TODO Get the namespace prefix
    });

    this.jsonSchemas[sNamespaceUrl]=jsonSchema;

    return jsonSchema;
    


}

ns = function(prefixedString)
{

    prefixedStringAndUnprefixedString = prefixedString + ',' + prefixedString.slice(prefixedString.indexOf('\\:')+2);


    return prefixedStringAndUnprefixedString;


}

n$ = function(prefixedString)
{


    return $(ns(prefixedString));


}


$(document).ready(function(){


    t = new iQ_tax();




})


