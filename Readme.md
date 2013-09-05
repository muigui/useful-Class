
# useful-Class

  useful Classical inheritance scaffolding, including singletons and easy to use mixin functionality

## Installation

  Install with [component(1)](http://component.io):

    $ component install muigui/useful-Class

  Install with npm:

    $ npm install useful-Class

## API

### Class( descriptor:Object ):Function
See `Class.define` below for details of the `decriptor` Object options.

The only difference between `Class` and `Class.define` is that `Class` simply returns the constructor `Function` and does not try to create a class namespace for it.

### Class.define( class_namespace:String, descriptor:Object ):Function

The `descriptor` Object will contain all your properties and methods which will be added to your Class' prototype.

#### default Class descriptor options
The descriptor has the following **reserved** property names:

<table border="0" cellpadding="0" cellspacing="0" width="100%">
	<thead><tr><th>property</th><th>type</th><th>description</th></tr></thead>
	<tbody>
		<tr><td width="128">constructor</td><td width="96">Function</td><td>This Class' constructor. This is the method that is called when you do: <code>new Foo</code>.</td></tr>
		<tr><td>extend</td><td>Function|String</td><td><strong>OPTIONAL</strong>. If you want to inherit the properties and methods from an existing Class you reference the Class here.</td></tr>
		<tr><td>accessors</td><td>Object</td><td><strong>OPTIONAL</strong>. Each property in the <code>accessors</code> Object should have an Object with either a <code>get</code> method, a <code>set</code> method, or both. These will be added to the Class' prototype, using <code>Object.defineProperty</code></td></tr>
		<tr><td>mixins</td><td>Object</td><td><strong>OPTIONAL</strong>. An Object of properties and methods to mix into the Class' prototype.</td></tr>
		<tr><td>module</td><td>Object</td><td><strong>OPTIONAL</strong>. If you don't want the Class namespace to be created on the global context, then pass the Object to assign the class namespace to, e.g. a component or npm <code>module</code>.</td></tr>
		<tr><td>chain</td><td>Boolean</td><td><strong>OPTIONAL</strong>. Unless this is set explicitly to <code>false</code>, the Class instance will return its context – <code>this</code> – Object whenever an instance method of a Class returns <code>undefined</code>.</td></tr>
		<tr><td>singleton</td><td>Mixed</td><td><strong>OPTIONAL</strong>. Whether or not this Class is a <a href="http://en.wikipedia.org/wiki/Singleton_pattern">Singleton</a>.<br />
		If you want a Singleton set this property to be either <code>true</code> or to an Array of arguments you wish to pass to the constructor Function.<br />
		<strong>NOTE:</strong> <code>Class</code> will internally resolve any attempt to create a new instance of the singleton by simply returning the existing singleton instance.</td></tr>
		However, if a <code>type</code> is also supplied it will overwrite the <code>type</code> created from the <code>path</code>.</td></tr>
		<tr><td>__override__</td><td>Function</td><td>This is a reserved method name for overriding a <code>Class</code> instance's methods.</td></tr>
		<tr><td>mixin</td><td>Function</td><td>This is a reserved method name for calling <code>mixin</code> methods.</td></tr>
		<tr><td>original</td><td>Function</td><td>This is a special reserved method name used by overridden methods to call the original method they overrode.</td></tr>
		<tr><td>parent</td><td>Function</td><td>This is a special reserved method for calling <code>super</code> methods. Since <code>super</code> is a reserved word in JavaScript, <code>parent</code> has been used in its place.</td></tr>
	</tbody>
</table>

### Class.create( class_namespace:String, [arg1:Mixed, arg2:Mixed, ..., argN:Mixed] ):Object
A factory method to allow you to:

- create an instance of a class by passing it a reference to its class namespace;
- create an instance of a class using an arbitrary number of arguments; and
- not worry about the correct value of `this`

#### Class.new( class_namespace:String, [arg1:Mixed, arg2:Mixed, ..., argN:Mixed] ):Object
Alias for the `Class.create` method above.

### Class.get( class_namespace:String ):Function
Returns the `Class` matching the passed class namespace or `null` if none is found.

### Class.is( instance:Object, Class:Function|String ):Boolean
Returns `true` if the passed instance is an instance of the passed Class.

**NOTE:** This function uses `instanceof` internally, the only extra thing it does is, if a `String` is passed as the `Class` parameter, try to find the matching constructor `Function`.

### Class methods
These are the methods available on a newly created `Class`

#### create( [arg1:Mixed, arg2:Mixed, ..., argN:Mixed] ):Object
A `create` factory method is added to your Class constructor to allow you to:

- create an instance of a class using an arbitrary number of arguments; and
- not worry about the correct value of `this`

See the **Class Examples** below on how to create `Class` instances using the `create` factory on your class or the `Class.create` factory.

#### new( [arg1:Mixed, arg2:Mixed, ..., argN:Mixed] ):Object
Alias for the `create` method above.

### instance methods

#### this.parent()
When you create an instance of a Class created with `Class` you can access the `super` method of a Class you are extending by calling:

```javascript

   this.parent( arg1, arg2, ..., argN );

```

Context will be maintained correctly, unless you use Function `.call` or `.apply`. In which case you should pass the context in as normal.

##### Example

```javascript

   this.parent.call( this, arg1, arg2, ..., argN );

// or

   this.parent.apply( this, [arg1, arg2, ..., argN] );

```

### TODO — Add docs for using mixins

### Class examples:

```javascript

   Class.define( 'Foo', {
      constructor : function( greeting ) {
         this.greeting = greeting;
         this.setNum( 10 );
      },
      getNum      : function() { return this.num; },
      setNum      : function( num ) { return ( this.num = num ); }
   } );

   Class.define( '^path.to.Bar', {
      constructor : function( greeting ) { this.parent( 'bar: ' + greeting, true ); },
      extend      : Foo,
      module      : m8.ENV === 'commonjs' ? module : null,
      getNum      : function() { return this.parent(); }
   } );

   var Zaaz = Class.define( {
      constructor : function( greeting ) { this.parent( 'zaaz: ' + greeting, true ); },
      extend      : path.to.Bar
   } );

   var foo  = new Foo( 'hello world!' ),
       bar  = Class.new( 'path.to.Bar', 'hello world!' ),
       zaaz = Zaaz.create.apply( this, ['hello world!'] );

   foo.greeting;              // returns => "hello world!"
   foo.getNum()       === 10  // returns => true
   foo.setNum( 100 )  === 100 // returns => true
   foo.getNum()       === 100 // returns => true

   bar.greeting;              // returns => "bar: hello world!"
   bar.getNum()       === 10  // returns => true
   bar.setNum( 200 )  === 200 // returns => true
   foo.getNum()       === 100 // returns => true

   zaaz.greeting;             // returns => "bar: zaaz: hello world!"
   zaaz.getNum()      === 10  // returns => true
   zaaz.setNum( 400 ) === 400 // returns => true

```


## License

(The MIT License)

Copyright (c) 2011 christos "constantology" constandinou http://muigui.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
