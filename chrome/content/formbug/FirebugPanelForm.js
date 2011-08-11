function FormbugPanelForm (conElm, formElm) {

	var that = this;
	
	(function (contextElm, elm) {
		that.context = contextElm;
	
		that.detailsToggled = false;
	
		that.toggleDetails = function () {
			
			if (that.detailsToggled) {
				
				that.panelLine.nextSibling.style.display = "none";
			
			} else {
			
				if ( ! that.panelLine.nextSibling 
					|| that.panelLine.nextSibling.getAttribute("class") !== "firebug-formpanel-formdetails") {
				
					var formDetails = Firebug.Formbug.json_to_html(Firebug.Formbug.form_to_json(that.formElement), that.formElement.getAttribute("action"));
					formDetails.style.display = "block";
					formDetails.style.color = "black";
					formDetails.style.border = "1px solid #ccc";
					formDetails.style.padding = "5px";
					formDetails.class = "firebug-formpanel-formdetails";
	
					// Finally, append the node we just made.  If this is the last node in the panel,
					// insert this at the end.  Otherwise, insert it right after the panelLine
					if (that.panelLine.parentNode.childNodes[that.panelLine.parentNode.childNodes.length - 1] == that.panelLine) {
					
						that.panelLine.parentNode.appendChild(formDetails);
					
					} else {
						
						var panelLineIndex = 0;
						
						while (panelLineIndex < that.panelLine.parentNode.childNodes.length
							&& that.panelLine.parentNode.childNodes[panelLineIndex] != that.panelLine) {
							
							panelLineIndex++;
						}
						
						that.panelLine.parentNode.insertBefore(formDetails, that.panelLine.parentNode.childNodes[panelLineIndex + 1]);
					
					}
					
				} else {
				
					that.panelLine.nextSibling.style.display = "block";
				
				}		
			}	
		
			that.detailsToggled = !that.detailsToggled;
		
		};
	
		that.formElement = elm;
		
		that.panelLine = null;
		
		that.attributeColor = "#ff8000";
		
		that.attributeValueColor = "#008040";
		
		that.events = {};
		
		that.addAttributeTag = function (attributeType, attributeValue) {
		
			var string; 
			
			string = " <span style='color: " + that.attributeColor + ";'>" + attributeType + "</span>";
			string += "=\"<span style='color: " + that.attributeValueColor + ";'>" + attributeValue + "</span>\"";
		
			return string;
		};
		
		that.toElm = function() {
		
			var form_string = "[form"; 	// string that will be used to represent the form 
										// in the Firebug Panel
										
			var attributes = ["name", "id", "action", "method"]; 	// attributes we'll check for when
																	// populating the above string
																	
			var i; // obvi
			var key; 
				
			var form_desc = that.context.document.createElement("p");
			form_desc.formElement = that.formElement;

			if (that.events) {
	
				for (key in that.events) {	
					form_desc.addEventListener(key, that.events[key], false);			
				}
			}
			
			for (i = 0; i < attributes.length; i++) {
	
				if (that.formElement.getAttribute(attributes[i])) {
	
					form_string += that.addAttributeTag(attributes[i], that.formElement.getAttribute(attributes[i]));
				}
			}
			
			var inputs = that.formElement.getElementsByTagName("input");
			var selects = that.formElement.getElementsByTagName("select");
			var textareas = that.formElement.getElementsByTagName("textarea");
			var numInputs = inputs.length + selects.length + textareas.length;
	
			form_string += that.addAttributeTag("num_inputs", numInputs);
			form_string += "]";
			
			form_desc.style.color = "blue"; 
			form_desc.style.cursor = "pointer"; 
			form_desc.innerHTML = form_string;
	
			that.panelLine = form_desc;
	
			form_desc.firebugPanelFormObj = that;		
			form_desc.aFormElement = that.formElement;
			return form_desc;
		};
	}(conElm, formElm));

	this.getFormElement = function () {
		return that.formElement
	}; 
};