	function Configurable( config ) {
		this.applyConfig( this.initConfig( config ) );

		this.autoInit === false || this.init();
	}

	module.exports         = Configurable;

	Configurable.prototype = {
		constructor    : Configurable,
// instance configuration properties
// public properties
		autoInit       : true,
// internal properties
		__config__     : null,
// public methods
// internal methods
// constructor methods
		applyConfig    : function( config ) {
			if ( config && typeof config == 'object' ) {
				for ( var key in config ) {
					if ( Object.prototype.hasOwnProperty.call( config, key ) ) {
						if ( typeof config[key] == 'function' && typeof this[key] == 'function' ) // this allows you to override a method for a
							this.__override__( key, config[key] );                                // specific instance of a Class, rather than require
						else                                                                      // you extend the Class for a few minor changes
							this[key] = config[key];                                              // NB: can also be achieved by creating a `singleton`
					}
				}
			}

			this.__config__ = config;

			return this;
		},
		init           : function() { return this; },
		initConfig     : function( config ) {
			return config && typeof config == 'object' ? config : {};
		}
	};
