FBL.ns(function() { with (FBL) { 

Firebug.Formbug = extend(Firebug.Module, 
{
	inspecting_forms: false,
	
	form_popup: false,
	
	toggle_form_inspection: function () 
	{	
		// If this is the first time were here, do the form popup
		if ( ! content.document.getElementById("firebug-formbug-form-popup"))
		{
			var popup = content.document.createElement("div");
			popup.id = "firebug-formbug-form-popup";
			popup.style.border = "1px solid grey";
			popup.style.backgroundColor = "red";
			popup.style.overflow = "hidden";
			popup.style.opacity = 0.9;
			popup.style.minHeight = "50px";
			popup.style.minWidth = "50px";
			popup.style.width = "auto";
			popup.style.display = "none";
			popup.style.position = "absolute";
			popup.style.padding = "1em";
			popup.style.boxShadow = "0pt 0pt 1em black";
			
			Components.utils.reportError(popup);
			Components.utils.reportError(content.document.body);
			
			content.document.body.appendChild(popup);
			Firebug.Formbug.form_popup = popup;
		}
		else
		{
			Firebug.Formbug.form_popup = content.document.getElementById("firebug-formbug-form-popup");
			Components.utils.reportError(Firebug.Formbug.form_popup);		
		}
	
		var forms = content.document.getElementsByTagName("form");		
		var i;
		
		if (Firebug.Formbug.inspecting_forms) // If were already inspecting forms, remove event listener and styling
		{
			document.getElementById("inspect_forms").setAttribute("checked", "false");
					
			for (i = 0; i < forms.length; i++)
			{
				forms[i].removeEventListener("mousemove", Firebug.Formbug.update_form_info, true);
				forms[i].removeEventListener("mouseout", Firebug.Formbug.hide_form_info, true);
				forms[i].removeEventListener("mouseover", Firebug.Formbug.show_form_info, true);				
				forms[i].style.border = "";						
			}
		}
		else
		{
			document.getElementById("inspect_forms").setAttribute("checked", "true");
		
			for (i = 0; i < forms.length; i++)
			{
				forms[i].addEventListener("mousemove", Firebug.Formbug.update_form_info, true);
				forms[i].addEventListener("mouseout", Firebug.Formbug.hide_form_info, true);
				forms[i].addEventListener("mouseover", Firebug.Formbug.show_form_info, true);
				forms[i].style.border = "2px solid red";
			}
		}
	
		Firebug.Formbug.inspecting_forms = !Firebug.Formbug.inspecting_forms;
	},
	
	list_all_forms: function ()
	{
		var forms = content.document.getElementsByTagName("form");		
		
		if ( ! forms)
		{
			FirebugContext.getPanel("Formbug").printLine("Error: No forms in document");
		}
		else
		{
			for (var i = 0; i < forms.length; i++)
			{
				(function () {					
					var current_form = forms[i];
					var form_information = new FormbugPanelForm(content, current_form);

					form_information.events = {
						mouseover: function (evt) {
							this.previousBorderStyle = current_form.style.border;
							current_form.style.border = "2px solid red";
						},
						mouseout: function (evt) {
							current_form.style.border = this.previousBorderStyle;
						},
						click: function () {
							form_information.firebugPanelFormObj.toggleDetails();
						}
					};
					
					FirebugContext.getPanel("Formbug").printElm(form_information.toElm());				
				}());
			}
		}
	},

	hide_form_info: function (evt)
	{
		Firebug.Formbug.form_popup.style.display = "none";	
	},
	
	update_form_info: function (evt)
	{
		Firebug.Formbug.form_popup.style.display = "block"
		// Make sure the popup doesn't trigger horizontal scrolls
		if (Firebug.Formbug.form_popup.offsetWidth + evt.clientX + 10 < content.document.body.clientWidth)
		{
			Firebug.Formbug.form_popup.style.left = evt.clientX + 10 + "px";
		}
		else
		{
			Firebug.Formbug.form_popup.style.left = evt.clientX - Firebug.Formbug.form_popup.offsetWidth - 10 + "px";
		}
	
		// And also make sure the popup doesn't trigger vertical scrolls	
		if (evt.clientY - Firebug.Formbug.form_popup.offsetHeight - 10 < 0)
		{
			// Draw the dialog pointing below the current point
				Components.utils.reportError("1");
			Firebug.Formbug.form_popup.style.top = evt.clientY + 10 + "px";
		}
		else
		{
				Components.utils.reportError("2");
			Firebug.Formbug.form_popup.style.top = evt.clientY - Firebug.Formbug.form_popup.offsetHeight - 10 + "px";
		}
	},
	
	show_form_info: function (evt)
	{
		var form = Firebug.Formbug.parent_form(evt.target);
		if (form)
		{
			Firebug.Formbug.form_popup.style.display = "block";				
			Firebug.Formbug.form_popup.innerHTML = "";
			Firebug.Formbug.form_popup.appendChild(Firebug.Formbug.json_to_html(Firebug.Formbug.form_to_json(form)));
		}
	},

  shutdown: function()
  {
		if (Firebug.getPref('defaultPanelName')=='Formbug')
		{
			Firebug.setPref('defaultPanelName','console');
		}
  },
    
  showPanel: function(browser, panel) 
  { 	
    var isFormbug = panel && panel.name == "Formbug"; 
    var FormbugButtons = Firebug.chrome.$("fbFormbugButtons"); 
    collapse(FormbugButtons, !isFormbug); 
  }, 
    
  serialize_form: function (elm)
  {
  	var result = Firebug.Formbug.parent_form(elm);
  	
		if (result)
		{
			var json = Firebug.Formbug.form_to_json(result);
			Firebug.Formbug.print_json(json, result.getAttribute("action"));
		}
  },
    
  serialize_all_forms: function ()
  {
  	var forms = content.document.getElementsByTagName("form");
		var i;
		
		if (forms.length === 0)
		{
			FirebugContext.getPanel("Formbug").printLine("Error: No forms in document");			
		}
		else
		{
			for (i = 0; i < forms.length; i++)
			{
				Firebug.Formbug.serialize_form(forms[i]);
			}
		}
  },
    
  parent_form: function (elm)
  {
  	if (!elm)
  	{
			FirebugContext.getPanel("Formbug").printLine("Error: Not a valid element");			    	
  	}
  	else
  	{
    	while (elm && elm.tagName.toUpperCase() !== "FORM" && elm.tagName.toUpperCase() !== "BODY")
    	{
    		elm = elm.parentNode;
    	}
	    
    	if (!elm || elm.tagName.toUpperCase() !== "FORM")
    	{	    	
				return false;
    	}
    	else
			{
				return elm;
			}    
  	}
  },
    
  populate_form: function (elm)
  {
		var result = Firebug.Formbug.parent_form(elm);
		
		if (!result || result.tagName.toUpperCase() !== "FORM")
		{
			FirebugContext.getPanel("Formbug").printLine("Error: Cannot find parent form for this node");	
		}
		else
		{
			var j, k;
			var inputs, selects, textareas, options, radios;
			var new_value;
	
			radios = new Array();
			
			inputs = result.getElementsByTagName("input");
			selects = result.getElementsByTagName("select");			
			textareas = result.getElementsByTagName("textarea");
			
			for (j = 0; j < inputs.length; j++)
			{
				// if its type text 
				switch (inputs[j].getAttribute("type"))
				{
					case "checkbox":
						inputs[j].setAttribute("checked", "checked");
						break;
						
					case "radio":
						if (radios.indexOf(inputs[j].getAttribute("name")) === -1)
						{
							inputs[j].setAttribute("checked", "checked");
							radios.push(inputs[j].getAttribute("name"));							
						}
						break;
						
					case "button":
					case "submit":
					case "hidden":
						break;							
						
					case "text":
					default:
						new_value = (inputs[j].getAttribute("name"))
							? inputs[j].getAttribute("name")
							: "INPUT " + (j + 1);
							
						inputs[j].value = new_value;
						inputs[j].style.background = "yellow";				
						break;									
				}
			}	
		
			for (j = 0; j < selects.length; j++)
			{
				options = selects[j].getElementsByTagName("option");
	
				new_value = false;
				
				for (k = 0; k < options.length; k++)
				{
					options[k].setAttribute("selected", "");
				
					if (!new_value)
					{
						if (options[k].getAttribute("value")) 
						{
							new_value = options[k].setAttribute("selected", "selected");
						}
					}
				}
	
				selects[j].style.background = "#AFD0E3";				
			}
			
			for (j = 0; j < textareas.length; j++)
			{
				new_value = (textareas[j].getAttribute("name"))
					? textareas[j].getAttribute("name")
					: "TEXTAREA " + (j + 1);
			
				textareas[j].innerHTML = new_value;
				textareas[j].style.background = "yellow";				
			}				
			
			result.style.border = "2px solid red";
			
    	var json = Firebug.Formbug.form_to_json(elm);
			Firebug.Formbug.print_json(json, result.getAttribute("action"));	    	
    }				
  },
    
  populate_all_forms: function() 
  {
  	var forms = content.document.getElementsByTagName("form");
		var i;
		
		if (forms.length === 0)
		{
			FirebugContext.getPanel("Formbug").printLine("Error: No forms in document");			
		}
		else
		{
			for (i = 0; i < forms.length; i++)
			{
				Firebug.Formbug.populate_form(forms[i]);
			}
		}
  },
    
  form_to_json: function (form) 
  {
  	var form_values = {};
    
		var i, j, key; // Iterators
		var inputs, selects, textareas, options, radios;
		var new_value;
		
		radios = new Array();
		
		inputs = form.getElementsByTagName("input");
		selects = form.getElementsByTagName("select");			
		textareas = form.getElementsByTagName("textarea");
    
  	for (i = 0; i < inputs.length; i++)
  	{
  		if (inputs[i].getAttribute("name"))
  		{
    		switch (inputs[i].getAttribute("type").toUpperCase())
    		{
    			case "CHECKBOX":
    			case "RADIO":    			
    				if (inputs[i].checked) {
    					form_values[inputs[i].getAttribute("name")] = inputs[i].value;
    				}
    				break;
    				
    			case "BUTTON":
    			case "SUBMIT":
    			case "HIDDEN":	    			
    			case "TEXT":		
    			default:    			
    				form_values[inputs[i].getAttribute("name")] = inputs[i].value;
    				break;	    		
    		}    		
  		}
  	}
  	
  	for (i = 0; i < selects.length; i++)
  	{
  		if (selects[i].getAttribute("name"))
  		{
  			options = selects[i].getElementsByTagName("option");

				for (j in options)
				{
					if (options[j].getAttribute("checked") === "checked")
					{
						form_values[selects[i].getAttribute("name")] = options[j].value;
					}
				}
			}    		
  	}
    	
  	for (i = 0; i < textareas.length; i++)
  	{
  		if (textareas[i].getAttribute("name"))
  		{
				form_values[textareas[i].getAttribute("name")] = textareas.innerHTML;
			}    	
  	}
    	
  	return form_values;
  },
    
	print_json: function (json, title)
	{
		var div = Firebug.Formbug.json_to_html(json, title);
		FirebugContext.getPanel("Formbug").printElm(div);
	},
    
  json_to_html: function (json, title)
  {
  	if (!title)
  	{
  		title = "Form: "
  	}
    
  	var container = content.document.createElement("div");
  	container.style.padding = ".25em";    

		var br = content.document.createElement("br");
		
		var begin = content.document.createElement("span");
		begin.innerHTML = title + " {";
		container.appendChild(begin);
		container.appendChild(br);
		
		for (var key in json)
		{
			var entry_row = content.document.createElement("div");
			entry_row.style.clear = "both";			
			entry_row.style.overflow = "hidden";
			entry_row.style.paddingLeft = "2em";
			entry_row.innerHTML = "<div style='font-weight: bold; width: 10em; float: left;'>" + key + ": </div><div style='float: left; width: 20em;'>" + json[key] + "</div>";
				
			container.appendChild(entry_row);
		}
		
		var end = content.document.createElement("span");
		end.innerHTML = "}";
		container.appendChild(end);
		container.appendChild(br);		
		container.appendChild(br);
		
		return container;
  }
}); 

function FormbugPanel() {} 
FormbugPanel.prototype = extend(Firebug.Panel, 
{ 
    name: "Formbug", 
    title: "Forms", 
    searchable: false, 
    editable: false,
    
    printElm: function(elm)
    {
    	elm.style.width = "90%";
			this.panelNode.appendChild(elm);
    },
    
    printLine: function(message)
    {
      var elt = this.document.createElement("p");
      elt.innerHTML = message;
      this.panelNode.appendChild(elt);
    }    
}); 


Firebug.registerModule(Firebug.Formbug); 
Firebug.registerPanel(FormbugPanel); 

}});