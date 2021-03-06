/***************************************************************************
 * THE TERRY BINDER!
 * froggr - v0.0.1 - Sept 2016
 * 
 *  So this library was forked originally from github.com/petersirka/jquery.bindings
 *  The reason for this drunken mess was that I'm working on a project that used angular
 *  for simple databinding. Im a fan of angular but it felt like we were going at a simple need
 *  with a tank. We needed something that was low maintenance to get the job done quick and dirty.
 *	*******************************************************************************/
var css = "text-shadow: -1px -1px hsl(0,100%,50%), 1px 1px hsl(5.4, 100%, 50%), 3px 2px hsl(10.8, 100%, 50%), 5px 3px hsl(16.2, 100%, 50%), 7px 4px hsl(21.6, 100%, 50%), 9px 5px hsl(27, 100%, 50%), 11px 6px hsl(32.4, 100%, 50%), 13px 7px hsl(37.8, 100%, 50%), 14px 8px hsl(43.2, 100%, 50%), 16px 9px hsl(48.6, 100%, 50%), 18px 10px hsl(54, 100%, 50%), 20px 11px hsl(59.4, 100%, 50%), 22px 12px hsl(64.8, 100%, 50%), 23px 13px hsl(70.2, 100%, 50%), 25px 14px hsl(75.6, 100%, 50%), 27px 15px hsl(81, 100%, 50%), 28px 16px hsl(86.4, 100%, 50%), 30px 17px hsl(91.8, 100%, 50%), 32px 18px hsl(97.2, 100%, 50%), 33px 19px hsl(102.6, 100%, 50%), 35px 20px hsl(108, 100%, 50%), 36px 21px hsl(113.4, 100%, 50%), 38px 22px hsl(118.8, 100%, 50%), 39px 23px hsl(124.2, 100%, 50%), 41px 24px hsl(129.6, 100%, 50%), 42px 25px hsl(135, 100%, 50%), 43px 26px hsl(140.4, 100%, 50%), 45px 27px hsl(145.8, 100%, 50%), 46px 28px hsl(151.2, 100%, 50%), 47px 29px hsl(156.6, 100%, 50%), 48px 30px hsl(162, 100%, 50%), 49px 31px hsl(167.4, 100%, 50%), 50px 32px hsl(172.8, 100%, 50%), 51px 33px hsl(178.2, 100%, 50%), 52px 34px hsl(183.6, 100%, 50%), 53px 35px hsl(189, 100%, 50%), 54px 36px hsl(194.4, 100%, 50%), 55px 37px hsl(199.8, 100%, 50%), 55px 38px hsl(205.2, 100%, 50%), 56px 39px hsl(210.6, 100%, 50%), 57px 40px hsl(216, 100%, 50%), 57px 41px hsl(221.4, 100%, 50%), 58px 42px hsl(226.8, 100%, 50%), 58px 43px hsl(232.2, 100%, 50%), 58px 44px hsl(237.6, 100%, 50%); font-size: 25px;";

console.log('%cThis%s', css, ' is Terry. What up. Just so you know, I am in the early stages of ripping this script to pieces. So I\'ll be dropping crap to the console LEFT AND RIGHT. If you don\'t like it, go %&!$ a *%#&!');



$.fn.binder = function (type, schema, object) {
	var self = this;









	/****************************************************************************************
    * Initialization Check!
    * -> The following are some initial checks that occur when first initializing terrybinder!
    ******************************************************************************************/


	/* if a jQuery element and a model reference aren't included, check the page and bind all referenced models */
	if(this.selector == "" && this.attr('data-model-name') == undefined && schema == undefined){
		var models = $('[data-model-name]');
		$('[data-model-name]').each(function(i){ 
			var schema = $(this).attr('data-model-name');

			if (typeof ($.binder.scope[schema]) == 'undefined'){
				binder_build_model(schema);		
			}

			$('[data-model-name="'+schema+'"]').binder(type, schema);
		});
		return;
	}
	/* If the schema (name of model) was not passed, use the model name data attribute */
	else if(schema == undefined)
		var schema = self.attr('data-model-name');
	/* if there is no model name and no model attribute, kill the script and ask whats up? */
	else if((this.attr('data-model-name') == undefined) && (schema == undefined))
		return console.error('ARGH! Terry is PISSED! The binder has been shut off cuz of yer err\'!\nYou have passed a jQuery element that doesn\'t have a model name attached to it!  Either initiate Terry Binder globally with $.fn.binder or reference an element with the [data-model-name] attribute present!\nIf you need help, check out the docs (http://froggr.github.io/terry-binder.js) even tho they kinda suck!');

	/* check if model scope has been defined and if not, create scope for the model */
	if($.binder.scope[schema] == undefined)
		$.binder.scope[schema] = {};

	/* Save the name of the model/schema to a variable in global scope */
	$.binder.scope[schema].schema = schema;


	if (typeof (type) === 'undefined')
		type = 'model'; //this sets the default command to return model. this may need to be removed.


	/* check if an object has been passed on create. If yes, set as model in global scope. If not, create a new blank model using the bound inputs in the DOM */ 
	if (typeof(object) == 'object' && type == 'create'){
		$.binder.scope[schema].model = object;				
	}
	else if (typeof ($.binder.scope[schema].model) === 'undefined'){
		binder_build_model(schema);		
	}












	/****************************************************************************************
	*
	*   The Bind!
	*
	****************************************************************************************/

	var scope = $.binder.scope[schema]; // set scope for the particular bound model.

	/* This switch is a work in progress... Most used to be anonymous functions but this setup seemed way easier when dealing with a ton of models at one time */
	switch (type) {
		case 'create':
			return binder_create.call(self, scope, template = undefined); 
		case 'change':
			return (function (value) { if (typeof (value) !== 'boolean') return self.data('isChange') || false; return self.data('isChange', value); });
		case 'refresh':
			binder_refresh.call(self, schema);
		return;
		case 'destroy':
			binder_destroy.call(self, schema);
		return;
		case 'default':
			binder_default.call(self, schema);
		return;
		case 'validate':
			case 'validation':
			return binder_validate.call(self, schema);
		case 'set':
			return (function (path, value) { return binder_set.call(self, path, value, schema); });
		case 'get':
			return (function (path) { return binder_get.call(self, path, schema); });
		case 'update':
			return binder_create.call(self, object, schema);
		case 'model':
			return scope.model;
	}
	return self;
};

function binder_create(scope, template) {
	var self = this;
	model = scope.model;
	scope.valid = true;
	schema = scope.schema;	
	scope.autosave = {data:{},active: false};
	if( $('[data-model-name="'+schema+'"]').is('[data-model-autosave]')){
		scope.autosave.active = true;
	}
	scope.load_time = new Date();

	if (typeof (scope.model) === 'undefined' || scope.model === null)
		return $.extend({}, self.data('model'));

	console.log(scope.model);
	var tmp = self.data('model');

	self.data('isChange', false);

	if (typeof (tmp) !== 'undefined') {
		if (typeof (scope.model) === 'function') {
			tmp = scope.model(tmp);
			if (tmp)
				self.data('model', tmp);
		}
		else
			self.data('model', scope.model);

		binder_refresh.call(self, schema);
		self.trigger('model-update', [scope.model, schema]);
		return self;
	}

	if (typeof (template) !== 'undefined') {
		if (template.substring(0, 1) === '/') {
			self.trigger('template-download-begin', [template]);
			$.get(template, {}, function (data) {
				self.trigger('template-download-end', [template, data]);
				binder_create.call(self, self.data('model'), data);
			});
			return;
		}

		if (template.indexOf('>') !== -1 && template.indexOf('<') !== -1)
			self.html(template);
		else
			template = $(template).html();
	}

	self.data('default', $.extend(true, {}, scope.model));
	self.data('model', scope.model);

	self.on('input', 'input[data-model],textarea[data-model], div[data-model][contenteditable="true"], select[data-model]', function (e) {
		binder_internal_change.call(this, e, self, self.data('model'), scope.schema, scope);
	});

	self.on('input change', 'input[data-model][type="radio"],input[data-model][type="checkbox"],input[type="hidden"]', function (e) {
		binder_internal_change.call(this, e, self, self.data('model'), scope.schema, scope);
	});
/*
	self.on('DOMSubtreeModified', '[data-model-calc]', function (e) {
		binder_internal_change.call(this, e, self, self.data('model'), scope.schema, scope);
        console.warn(123);
	});
*/


	binder_refresh.call(self, schema);

	binder_delay(function() {
		self.trigger('model-create', [scope.model, schema]);
	});

	return binder_rebind.call(self);
}

function binder_internal_change(e, self, model, schema, scope) {
	var el = $(this);
	var name = el.attr('data-model');
	var type = el.attr('type');


	/* allow for different datatypes. */
	if (el[0].value !== undefined) {
		var value = el.val();

	} else {
		var value = el.html();

	}


	if (!(/(MSIE\ [0-8]\.\d+)/.test(navigator.userAgent)))
		e.preventDefault();

	e.stopPropagation();
	e.stopImmediatePropagation();

	if (type === 'checkbox')
		value = this.checked;

	var prepare = el.attr('data-prepare');
	var value_new = $.binder.prepare.call(el, name, value, prepare, model, schema);



	/* The actual checking of autosave for the model... */
	if (typeof (value_new) === 'undefined')
		value_new = $.binder._prepare.call(el, name, value, prepare, model, schema);
	console.log(schema);
	var r = $.binder._validation.call(el, name, value_new, model, schema);


	/* Watch function deals with validation errors */
	$.binder.watch.call(el, r, name, value_new, model, schema);

	if (!r){
		/* This stops binding if validation fails! */
		//consider dealing with autosave on validation fail here...
		if(scope.autosave.active){
			scope.autosave.data[name] = 'invalid';
			binder_autosave(self, scope, name, value_new, model, schema, el);
		}

		return;
	}

	binder_setvalue.call(el, model, name, value_new, schema); // LET THE BINDING BEGIN!

	binder_show(self, model, name, schema, scope); // deal with conditional display of any element in bound div	
	

	self.trigger('model-calc', [self, scope, name, model, schema]);

	if (type == 'radio') {
		this.checked = value;
	}

	binder_rebind.call(self, schema);
	self.data('isChange', true);
	binder_delay(function() {
		self.trigger('model-change', [name, value_new, model, schema, el]);
		self.trigger('model-update', [model, name, schema]);

		/* Trigger autosave for valid model */
		if(scope.autosave.active){
			scope.autosave.data[name] = 'valid'; // sets autosave validation scope to valid for model attribute
			binder_autosave(self, scope, name, value_new, model, schema, el);
		}
	});
}



function binder_destroy() {
	var self = this;
	var schema = self.attr('data-model-name');
	self.removeData('model');
	self.removeData('default');
	self.removeData('isChange');
	self.find('input[data-model],textarea[data-model],select[data-model],div[data-model]').unbind();
	self.unbind();
	self.trigger('model-destroy', [schema]);
	return self;
}

function binder_default() {
	var self = this;
	var model = self.data('default');
	var schema = self.attr('data-model-name');
	self.data('model', $.extend({}, model));
	self.data('isChange', false);
	binder_refresh.call(self, schema);
	binder_delay(function() {
		self.trigger('model-default', [model, schema]);
	});
	return self;
}

function binder_validate(schema) {
	var self = this;
	var model = self.data('model');
	var error = [];

	binder_reflection(model, function (path, value, key) {
		var r = $.binder._validation(path, value, schema);
		if (typeof (r) === 'undefined' || r === null || r)
			return;
		error.push({ path: path, value: value, element: self.find('input[data-model="' + path + '"],textarea[data-model="' + path + '"],select[data-model="' + path + '"]') });
	});

	self.trigger('validate', [error, schema]);
	self.trigger('validation', [error, schema]);
	self.trigger('model-validate', [error, schema]);
	self.trigger('model-validation', [error, schema]);
	return self;
}

function binder_set(path, value, schema) {
	var self = this;
	var model = self.data('model');

	if (typeof (model) === 'undefined')
		return self;

	if (typeof (value) === 'function')
		value = value(binder_getvalue(model, path, schema));

	var r = $.binder._validation(path, value, model, schema);
	$.binder.watch.call($('input[data-model="' + path + '"],textarea[data-model="' + path + '"],select[data-model="' + path + '"]'), r, path, value, model, schema);

	if (!r)
		return self;

	if (binder_setvalue(model, path, value, schema))
		binder_refresh.call(self, schema);

	self.data('isChange', true);
	self.trigger('model-update', [model, path, schema]);
	return self;
}

function binder_get(path, schema) {
	var self = this;
	var model = self.data('model');
	if (typeof (model) === 'undefined')
		return;
	return binder_getvalue(model, path, schema);
}

function binder_rebind_force(schema) {
    var self = this;
    var model = self.data('model');

    if (typeof (model) === 'undefined')
        return self;

    self.find('[data-model]').each(function () {
        var tag = this.tagName.toLowerCase();
        var el = $(this);
        var name = el.attr('data-model');
        var value = binder_getvalue(model, name);
		  
        var custom = el.attr('data-custom');
        if (typeof (custom) !== 'undefined') {
				if(typeof ($.binder.custom[custom]) == 'function'){
            	value = $.binder.custom[custom].call(el, name, value, custom || '', model, schema);
				}
				else
					console.error('The custom template "' + custom + '" that you defined in model: ' + schema + ' and attribute: ' + name + ' was not defined!');
        }

        var attr = el.attr('data-encode');
        var isRaw = typeof (attr) !== 'undefined' && attr === 'false';
        var val = $.binder.format.call(el, name, value, el.attr('data-format'), model, schema);


		 
        if (typeof (val) === 'undefined')
            val = '';

        if (typeof (val) !== 'string') {
            if (val instanceof Array)
                val = val.join(', ');
            else
                val = val === null ? '' : val.toString();
        }

		  if(el.is(":focus") == false) {
       		if ((tag === 'input' || tag === 'select' || tag === 'textarea') && !(el.is(':radio'))){
					if($(el)[0].hasAttribute('multiple'))
						console.log(val);				
					else	
						el.val(val);
				}
				else if ((el.is(':radio') ) || (tag == "select")){
					if (el.val() == val){
						console.log(val);
						el.prop('checked',true);
						if($(this).parent().parent().hasClass('btn-group')){
							$(this).parent().parent().children('label.btn').removeClass('active');
							$(this).parent().addClass('active');
						}
					}
					else
				  		return
			  }
		 		else
        			el.html(val);
    		}
	 });

	binder_show(self, model); // deal with conditional display of any element in bound div
	
	return self;
}

function binder_rebind(schema) {
	var self = this;
	var model = self.data('model');

	if (typeof (model) === 'undefined')
		return self;

	var timeout = self.data('timeout_rebind') || null;

	if (timeout !== null)
		clearTimeout(timeout);

	var timeout = setTimeout(function () {
		binder_rebind_force.call(self, schema);
	}, 100);

	self.data('timeout_rebind', timeout);
	return self;
}

function binder_refresh(schema) {
	var self = this;
	var model = self.data('model');

	if (typeof (model) === 'undefined')
		return self;

	var timeout = self.data('timeout_refresh') || null;
	if (timeout !== null)
		clearTimeout(timeout);

	var timeout = setTimeout(function () {
		binder_refresh_force.call(self, schema);
	}, 100);

	self.data('timeout_refresh', timeout);
	return self;
}

function binder_refresh_force(schema) {
	var self = this;

	var model = self.data('model');

	if (typeof (model) === 'undefined') {
		model = {};
		self.data('model', model);
	}

	self.find('[data-model]').each(function () {
		var el = $(this);
		var name = el.attr('data-model') || '';
		var isIO = false;

		switch (this.tagName.toLowerCase()) {
			case 'input':
				case 'textarea':
				case 'select':
				isIO = true;
			break;
		}

		var value = binder_getvalue(model, name, schema);
		var format = el.attr('data-format');
		var custom = el.attr('data-custom');

		if (typeof (value) === 'undefined')
			value = el.attr('data-default');

		if (typeof (custom) !== 'undefined') {
			$.binder.custom.call(el, name, value, custom || '', model, schema);
			return;
		}

		var val = $.binder.format.call(self, name, value, format, model, schema);

		if (isIO) {
			var type = el.attr('type');
			if (type === 'checkbox')
				this.checked = value === true || value === 1 || value === 'true';
			else if (type === 'radio') {
				if (this.value == value){
					this.checked = true;
					/* If bootstrap is being used, deal set bootstrap radio's active class */
					if($(this).parent().parent().hasClass('btn-group')){
						$(this).parent().parent().children('label.btn').removeClass('active');
						$(this).parent().addClass('active');
					}
				}
				else
					return;
			} else
				el.val(val);

			return;
		}

		var attr = el.attr('data-encode');
		var isRaw = typeof (attr) !== 'undefined' && attr === 'false';

		if (typeof (val) === 'undefined')
			val = '';

		if (typeof (val) !== 'string') {
			if (val instanceof Array)
				val = val.join(', ');
			else
				val = val === null ? '' : val.toString();
		}

		el.html(isRaw ? val : val.encode());
	});

	return self;
}

/* Bind the model when the page loads */
$(document).ready(function(){ 
	$('[data-bind-on-load]').each(function(i){ 
		var schema = $(this).attr('data-model-name');
		if (schema == undefined)
			return;
		/* Here you should check the model exists */

		if (typeof ($.binder.scope[schema]) === 'undefined')
			binder_build_model(schema);		

		$('[data-model-name="'+schema+'"]').binder('create', schema);

	});
});

// this variable holds the scope of each model. For now its global but it will likely be moved within the $.fn.binder()
$.binder = {'scope':{}};

$.binder.prepare = function (path, value, format, model, schema) { }

$.binder._prepare = function (path, value, format, model, schema) {
	if (typeof (value) !== 'string')
		return value;

	if (binder_getvalue(model, path) instanceof Array) {
		var arr = value.split(',');
		var length = arr.length;
		var tmp = [];
		for (var i = 0; i < length; i++) {
			var val = $.trim(arr[i]);
			if (val.length > 0)
				tmp.push(val);
		}
		return tmp;
	}

	if (!value.isNumber())
		return value;

	if (value[0] === '0' && value.length > 1)
		return value;

	value = value.replace(',', '.');
	if (value.indexOf('.') === -1)
		return parseInt(value);

	return parseFloat(value);
};

$.binder.format = function (path, value, format, model, schema) {
	if (value instanceof Array)
		return value.join(', ');
	return value;
};

$.binder.custom = function (path, value, custom, model, schema) { };

/*Default binder watch will add a bootstrap error. this is easliy overwritten */
$.binder.watch = function (isValid, path, value, model, schema) { 
};

$.binder.validation = function (path, value, model, schema) {
	return true;
};

$.binder._validation = function (path, value, model, schema) {
	if(typeof($.binder.validation[schema]) == 'function')
		var r = $.binder.validation[schema](path, value, model, schema);

	if (typeof (r) === 'undefined' || r === null)
		r = true;
	return r === true;
};

function binder_setvalue(obj, path, value, schema) {
	path = path.split('.');
	var length = path.length;
	var current = obj;

	for (var i = 0; i < length - 1; i++) {
		current = binder_findpipe(current, path[i]);

		if (typeof (current) === 'undefined')
			return false;
	}

	current = binder_findpipe(current, path[length - 1], value);
	return true;
}

function binder_findpipe(current, name, value) {
	var beg = name.lastIndexOf('[');
	var pipe;
	var index = -1;
	if (beg !== -1) {
		index = parseInt(name.substring(beg + 1).replace(/\]\[/g, ''));
		if (isNaN(index))
			return;

		name = name.substring(0, beg);
		pipe = current[name][index];

	} else
		pipe = current[name];
	
	if (typeof (pipe) === 'undefined'){
		current[name] = value;	
		return;
	}

	if (typeof(value) === 'undefined')
		return pipe;

	if (index !== -1) {
		current[name][index] = value;
		pipe = current[name][index];
	} else {
		current[name] = value;
		pipe = current[name];
	}
	return pipe;
}

function binder_getvalue(obj, path, schema) {
	path = path.split('.');
	var length = path.length;
	var current = obj;
	for (var i = 0; i < path.length; i++) {
		current = binder_findpipe(current, path[i]);
		if (typeof (current) === 'undefined')
			return;
	}
	return current;
}

if (!String.prototype.isNumber) {
	String.prototype.isNumber = function (isDecimal) {
		var self = this;
		var length = self.length;

		if (length === 0)
			return false;

		isDecimal = isDecimal || true;

		for (var i = 0; i < length; i++) {
			var ascii = self.charCodeAt(i);

			if (isDecimal) {
				if (ascii === 44 || ascii === 46) {
					isDecimal = false;
					continue;
				}
			}

			if (ascii < 48 || ascii > 57)
				return false;
		}

		return true;
	};
}

if (!String.prototype.encode) {
	String.prototype.encode = function () {
		return this.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	};
}

function binder_reflection(obj, fn, path) {
	path = path || '';
	for (var k in obj) {
		if (typeof (k) !== 'string')
			continue;

		var current = path + (path !== '' ? '.' : '') + k;
		var type = typeof (obj[k]);

		if (type === 'function')
			continue;

		fn(current, obj[k], k);

		if (type === 'object')
			binder_reflection(obj[k], fn, current);
	}
}

function	binder_show(self, model, name, schema, scope) { // deal with conditional display of any element in bound div	
	self.find('[data-show]').each(function () {
		el = $(this);
		var condition = el.attr('data-show');
		 if (typeof (condition) !== 'undefined') {
			if(eval(condition))
				el.show();
			else
				el.hide();
		}
	});

}


/* Not sure why there is a delay... testing this out */
function binder_delay(fn) {
	setTimeout(function() {
		fn();
	}, 2);
}

function binder_build_model(schema){
	$.binder.scope[schema] = {model:{}};
	var modelid = $('[data-model-name="'+schema+'"]').attr('data-model-id');
	if(typeof(modelid) != 'undefined')
		$.binder.scope[schema].model.id = modelid;
	$('[data-model-name="'+schema+'"]').find("[data-model]").each(function(){
		var inputelement = ['INPUT','TEXTAREA','SELECT','DATALIST']
		var key = $(this).attr("data-model");
		if(inputelement.indexOf(this.tagName) > -1){
			if (($(this).is(':radio') ) || ($(this).is('select'))){
				if ($(this).prop('checked')) 
					var attrib = $(this).val();
				else
					var attrib = ""; 
			}
			else
				var attrib = $(this).val(); 
		}
		else
			var attrib = $(this).html();
		$.binder.scope[schema].model[key] = attrib;        
	});
}

function binder_autosave(self, scope, name, value_new, model, schema, el) {
	if(scope.autosave.active == false)
		return;
	/* 
	 * This checks if the model is initially loading or if it has just saved, and if so blocks the autosave.
	 * Then once a save happens, a timer is fired for 3 seconds. If the user makes a change, the time is restart.
	 * a "Saving" notification is displayed to indicate to the user that a save is pending. Also, once a field
	 * is changed, angular inserts a .ng-dirty class which has been styled orange, indicating that data is unsaved.
	 * when the timer expires, data is changed to .ng-pristine and save is called. If data is changed while the
	 * save is happening, the autosave is fired again.
	 */
	if(scope.load_time !== undefined) {
		var load_ms = scope.load_time.getTime();
		var ms = new Date().getTime();

		var last_autosave = 0;

	if(scope.autosave.last_save !== undefined)
		last_autosave = scope.autosave.last_save.getTime();

	if(ms-load_ms < 1000 || ms-last_autosave < 10) { //lame fix to autosave firing when data is loaded
		return;
	}
} else return; //don't autosave until actually loaded..

if (scope.timer) {
	clearTimeout(scope.timer);
	console.log('Timeout Cleared');
	scope.senddata[name] = value_new;	
}
if (!scope.timer) {
	//notification({ icon: 'glyphicon glyphicon-save', title: ' <strong>Saving...</strong>' },{type: 'info', delay: 10000});
	console.info('Saving Delay Event Fired');
	self.trigger('autosave-delay', [scope.schema]);
	if(scope.senddata == undefined)
		scope.senddata = {};
	scope.senddata[name] = value_new;	
}

var invalid = false;
for(var key in scope.autosave.data){
	if (scope.autosave.data[key] != 'valid'){ invalid = true; }
}
if(invalid){
		clearTimeout(scope.timer);
		scope.timer = 0;
		scope.valid = false;
		self.trigger('autosave-delay', [scope.schema, 'validation']);
		return;
}


scope.timer = setTimeout(function() {
	scope.timer = 0;
	scope.autosave.last_save = new Date(0);
	console.info('AutoSave Event Fired'); 
	self.trigger('autosave', [scope.senddata, scope.schema, scope.model]);
	console.log(scope.senddata);
	delete scope.senddata; 
}, 3000);
}
