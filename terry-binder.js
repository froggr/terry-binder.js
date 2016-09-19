/***************************************************************************
* THE TERRY BINDER!
* froggr - 2016
* 
* TODO: 
*   - define models in binder function?
	 - define what path and schema actually do. where does it actually bind back to original object?
*   - if no jQuery element, find all [data-model-name]s and initialize bind
*   - for blank model, create 'schema' based on [data-model] within self
*
******************************************************************************/
var terrybinder_cache = {};
$.binder = {'model' : {}};

$.fn.binder = function (type, schema, object) {
    var self = this;

	if(this.selector == ""){
		var models = $('[data-model-name]');
		$('[data-model-name]').each(function(i){ 
			var schema = $(this).attr('data-model-name');
			
			/* Here you should check the model exists */
			
			if (typeof ($.binder.model[schema]) == 'undefined'){
				binder_build_model(schema);		
			}
			
			$('[data-model-name="'+schema+'"]').binder(type, schema);
		});
		return;
	}

   if (typeof (type) === 'undefined')
        type = 'model';
	
	if(schema == undefined)
   	var schema = self.attr('data-model-name');



	if (typeof ($.binder.model[schema]) === 'undefined'){
			console.error(schema);	
			binder_build_model(schema);		
	}
	
	if (typeof(object) == 'object'){
		$.binder.model[schema] = object;				
	}
	
	var model = $.binder.model[schema];
    switch (type) {
        case 'create':
            return binder_create.call(self, model, template = undefined, schema); 
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
            return (function (model) { return binder_create.call(self, model, schema); });
        case 'model':
            return binder_create.call(self, null, null, schema);
    }
    return self;
};

function binder_create(model, template, schema) {
    var self = this;

    if (typeof (model) === 'undefined' || model === null)
	    return $.extend({}, self.data('model'));

	 console.log(model);
    var tmp = self.data('model');

    self.data('isChange', false);

    if (typeof (tmp) !== 'undefined') {
        if (typeof (model) === 'function') {
            tmp = model(tmp);
            if (tmp)
                self.data('model', tmp);
        }
        else
            self.data('model', model);

        binder_refresh.call(self, schema);
        self.trigger('model-update', [model, schema]);
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

    self.data('default', $.extend(true, {}, model));
    self.data('model', model);
    
    self.on('input paste cut change', 'input[data-model],textarea[data-model],select[data-model], div[data-model][contenteditable="true"]', function (e) {
        binder_internal_change.call(this, e, self, self.data('model'), schema);
    });


    binder_refresh.call(self, schema);

    binder_delay(function() {
        self.trigger('model-create', [model, schema]);
    });

    return binder_rebind.call(self);
}

function binder_internal_change(e, self, model, schema) {
    var el = $(this);
    var name = el.attr('data-model');
    var type = el.attr('type');
	 if(el.attr('contenteditable') == 'true')
    	var value = el.html();
	 else
	   var value = el.val();

    if (!(/(MSIE\ [0-8]\.\d+)/.test(navigator.userAgent)))
        e.preventDefault();

    e.stopPropagation();
    e.stopImmediatePropagation();

    if (type === 'checkbox')
        value = this.checked;

    var prepare = el.attr('data-prepare');
    var value_new = $.binder.prepare.call(el, name, value, prepare, model, schema);

    if (typeof (value_new) === 'undefined')
        value_new = $.binder._prepare.call(el, name, value, prepare, model, schema);

    var r = $.binder._validation.call(el, name, value_new, model, schema);
    $.binder.watch.call(el, r, name, value_new, model, schema);

    if (!r)
        return;

    binder_setvalue.call(el, model, name, value_new, schema);

    if (type == 'radio') {
        this.checked = value;
	 }

    binder_rebind.call(self, schema);
    self.data('isChange', true);

    binder_delay(function() {
        self.trigger('model-change', [name, value_new, model, schema, el]);
        self.trigger('model-update', [model, name, schema]);
    });
}



function binder_destroy() {
    var self = this;
    var schema = self.attr('data-model-name');
    self.removeData('model');
    self.removeData('default');
    self.removeData('isChange');
    self.find('input[data-model],textarea[data-model],select[data-model],div[data-model]').unbind('change');
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
        if (el.is(':radio') || (tag == "select"))
            return;

        var name = el.attr('data-model');
        var custom = el.attr('data-custom');
        var value = binder_getvalue(model, name);

        if (typeof (custom) !== 'undefined') {
            $.binder.custom.call(el, name, value, custom || '', model, schema);
            return;
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
       		if ((tag === 'input' || tag === 'select' || tag === 'textarea')){
					if($(el)[0].hasAttribute('multiple'))
						console.log(val);				
					else	
						el.val(val);
				}
		 		else
        			el.html(val);
    		}
	 });

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
			
    		if (typeof ($.binder.model[schema]) === 'undefined')
				binder_build_model(schema);		
			
			$('[data-model-name="'+schema+'"]').binder('create', schema);

	});
});


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
$.binder.watch = function (isValid, path, value, model, schema) { };

$.binder.validation = function (path, value, model, schema) {
    return true;
};

$.binder._validation = function (path, value, model, schema) {
    var r = $.binder.validation(path, value, model, schema);
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

    if (typeof (pipe) === 'undefined')
        return;

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

function binder_delay(fn) {
    setTimeout(function() {
        fn();
    }, 120);
}

function binder_build_model(schema){
	$.binder.model[schema] = {};
	$('[data-model-name="obj"]').find('[data-model]').each(function(){console.log(1);});
   $('[data-model-name="'+schema+'"]').find("[data-model]").each(function(){
        var key = $(this).attr("data-model");
        $.binder.model[schema][key] = "";        
    });
}


