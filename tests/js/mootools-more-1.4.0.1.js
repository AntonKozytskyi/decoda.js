// MooTools: the javascript framework.
// Load this file's selection again by visiting: http://mootools.net/more/7c0c7033e1f4ad518e4afb3183380615
// Or build this file again with packager using: packager build More/Element.Forms More/Element.Shortcuts
/*
---
copyrights:
  - [MooTools](http://mootools.net)

licenses:
  - [MIT License](http://mootools.net/license.txt)
...
*/
MooTools.More={version:"1.4.0.1",build:"a4244edf2aa97ac8a196fc96082dd35af1abab87"};(function(){var c={a:/[àáâãäåăą]/g,A:/[ÀÁÂÃÄÅĂĄ]/g,c:/[ćčç]/g,C:/[ĆČÇ]/g,d:/[ďđ]/g,D:/[ĎÐ]/g,e:/[èéêëěę]/g,E:/[ÈÉÊËĚĘ]/g,g:/[ğ]/g,G:/[Ğ]/g,i:/[ìíîï]/g,I:/[ÌÍÎÏ]/g,l:/[ĺľł]/g,L:/[ĹĽŁ]/g,n:/[ñňń]/g,N:/[ÑŇŃ]/g,o:/[òóôõöøő]/g,O:/[ÒÓÔÕÖØ]/g,r:/[řŕ]/g,R:/[ŘŔ]/g,s:/[ššş]/g,S:/[ŠŞŚ]/g,t:/[ťţ]/g,T:/[ŤŢ]/g,ue:/[ü]/g,UE:/[Ü]/g,u:/[ùúûůµ]/g,U:/[ÙÚÛŮ]/g,y:/[ÿý]/g,Y:/[ŸÝ]/g,z:/[žźż]/g,Z:/[ŽŹŻ]/g,th:/[þ]/g,TH:/[Þ]/g,dh:/[ð]/g,DH:/[Ð]/g,ss:/[ß]/g,oe:/[œ]/g,OE:/[Œ]/g,ae:/[æ]/g,AE:/[Æ]/g},b={" ":/[\xa0\u2002\u2003\u2009]/g,"*":/[\xb7]/g,"'":/[\u2018\u2019]/g,'"':/[\u201c\u201d]/g,"...":/[\u2026]/g,"-":/[\u2013]/g,"&raquo;":/[\uFFFD]/g};
var a=function(f,h){var e=f,g;for(g in h){e=e.replace(h[g],g);}return e;};var d=function(e,g){e=e||"";var h=g?"<"+e+"(?!\\w)[^>]*>([\\s\\S]*?)</"+e+"(?!\\w)>":"</?"+e+"([^>]+)?>",f=new RegExp(h,"gi");
return f;};String.implement({standardize:function(){return a(this,c);},repeat:function(e){return new Array(e+1).join(this);},pad:function(e,h,g){if(this.length>=e){return this;
}var f=(h==null?" ":""+h).repeat(e-this.length).substr(0,e-this.length);if(!g||g=="right"){return this+f;}if(g=="left"){return f+this;}return f.substr(0,(f.length/2).floor())+this+f.substr(0,(f.length/2).ceil());
},getTags:function(e,f){return this.match(d(e,f))||[];},stripTags:function(e,f){return this.replace(d(e,f),"");},tidy:function(){return a(this,b);},truncate:function(e,f,i){var h=this;
if(f==null&&arguments.length==1){f="…";}if(h.length>e){h=h.substring(0,e);if(i){var g=h.lastIndexOf(i);if(g!=-1){h=h.substr(0,g);}}if(f){h+=f;}}return h;
}});})();Element.implement({tidy:function(){this.set("value",this.get("value").tidy());},getTextInRange:function(b,a){return this.get("value").substring(b,a);
},getSelectedText:function(){if(this.setSelectionRange){return this.getTextInRange(this.getSelectionStart(),this.getSelectionEnd());}return document.selection.createRange().text;
},getSelectedRange:function(){if(this.selectionStart!=null){return{start:this.selectionStart,end:this.selectionEnd};}var e={start:0,end:0};var a=this.getDocument().selection.createRange();
if(!a||a.parentElement()!=this){return e;}var c=a.duplicate();if(this.type=="text"){e.start=0-c.moveStart("character",-100000);e.end=e.start+a.text.length;
}else{var b=this.get("value");var d=b.length;c.moveToElementText(this);c.setEndPoint("StartToEnd",a);if(c.text.length){d-=b.match(/[\n\r]*$/)[0].length;
}e.end=d-c.text.length;c.setEndPoint("StartToStart",a);e.start=d-c.text.length;}return e;},getSelectionStart:function(){return this.getSelectedRange().start;
},getSelectionEnd:function(){return this.getSelectedRange().end;},setCaretPosition:function(a){if(a=="end"){a=this.get("value").length;}this.selectRange(a,a);
return this;},getCaretPosition:function(){return this.getSelectedRange().start;},selectRange:function(e,a){if(this.setSelectionRange){this.focus();this.setSelectionRange(e,a);
}else{var c=this.get("value");var d=c.substr(e,a-e).replace(/\r/g,"").length;e=c.substr(0,e).replace(/\r/g,"").length;var b=this.createTextRange();b.collapse(true);
b.moveEnd("character",e+d);b.moveStart("character",e);b.select();}return this;},insertAtCursor:function(b,a){var d=this.getSelectedRange();var c=this.get("value");
this.set("value",c.substring(0,d.start)+b+c.substring(d.end,c.length));if(a!==false){this.selectRange(d.start,d.start+b.length);}else{this.setCaretPosition(d.start+b.length);
}return this;},insertAroundCursor:function(b,a){b=Object.append({before:"",defaultMiddle:"",after:""},b);var c=this.getSelectedText()||b.defaultMiddle;
var g=this.getSelectedRange();var f=this.get("value");if(g.start==g.end){this.set("value",f.substring(0,g.start)+b.before+c+b.after+f.substring(g.end,f.length));
this.selectRange(g.start+b.before.length,g.end+b.before.length+c.length);}else{var d=f.substring(g.start,g.end);this.set("value",f.substring(0,g.start)+b.before+d+b.after+f.substring(g.end,f.length));
var e=g.start+b.before.length;if(a!==false){this.selectRange(e,e+d.length);}else{this.setCaretPosition(e+f.length);}}return this;}});Element.implement({isDisplayed:function(){return this.getStyle("display")!="none";
},isVisible:function(){var a=this.offsetWidth,b=this.offsetHeight;return(a==0&&b==0)?false:(a>0&&b>0)?true:this.style.display!="none";},toggle:function(){return this[this.isDisplayed()?"hide":"show"]();
},hide:function(){var b;try{b=this.getStyle("display");}catch(a){}if(b=="none"){return this;}return this.store("element:_originalDisplay",b||"").setStyle("display","none");
},show:function(a){if(!a&&this.isDisplayed()){return this;}a=a||this.retrieve("element:_originalDisplay")||"block";return this.setStyle("display",(a=="none")?"block":a);
},swapClass:function(a,b){return this.removeClass(a).addClass(b);}});Document.implement({clearSelection:function(){if(window.getSelection){var a=window.getSelection();
if(a&&a.removeAllRanges){a.removeAllRanges();}}else{if(document.selection&&document.selection.empty){try{document.selection.empty();}catch(b){}}}}});