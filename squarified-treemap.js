/*
* Squarified Treemaps 1.0.1
* Copyright (c) 2010 Joel Wan (http://spandiv.com)
* Licensed under the MIT license.
*/
Child = function (id, text, area, url, time) {
	this.init(id, text, area, url, time);
};

Child.prototype = {
	id: null,
	text: '',
	area: null,
	url: null,
	time : null,
	
	init : function (id, text, area, url, time) {
		this.id = id;
		this.text = text;
		this.area = area;
		this.url = url;
		this.time = time;
	}
};

Row = function (w, h, x, y) {
	this.init(w, h, x, y);
};

Row.prototype = {
	w : null,
	h : null,
	x : null,
	y : null,
	sub : null,
	
	init : function (w, h, x, y) {
		this.w = w;
		this.h = h;
		this.x = x;
		this.y = y;
		this.children = [];
		this.sub = this.w > this.h ? 'w' : 'h'; 
	},
	
	addChild : function (c) {
		this.children.push(c);
		s = this.sumChildren();
		if (this.sub == 'w') {
			h = ( c.area / s ) * this.h;
			this.w = (c.area / h);
		} else {
			w = ( c.area / s ) * this.w;
			this.h = (c.area / w);
		}
		return this;
	},
	
	popChild : function () {
		c = this.children.pop();
		s = this.sumChildren();
		if (this.sub == 'w') {
			h = ( c.area / s ) * this.h;
			this.w = (c.area / h);
		} else {
			w = ( c.area / s ) * this.w;
			this.h = (c.area / w);
		}
		return this;
	},
	
	sumChildren : function () {
		var sum = 0;
		for (var i=0; i<=this.children.length-1; i++) {
			sum = sum + this.children[i].area;
		}
		return sum;
	}
};

Treemap = function (w, h, children) {
	this.init (w, h, children);
};

Treemap.prototype = {
	w : null,
	h : null,
	wf : 0,
	hf : 0,
	r : null,
	
	init : function (w, h, children) {
		this.w = w;
		this.h = h;
		this.wf = 0;
		this.hf = 0;
		this.r = null;
		this.originW = w;
		this.originH = h;
		this.c = children.slice();
		this.rows = [];
		this.squarify (this.c, this.rows, this.width());
	},
	
	squarify : function (children, rows, w) {
		while (children.length > 0) {
			c = children.shift();
			if (c.area > 0) {
				if (rows.length == 0) {
					row = this.layoutrow(c, 0, 0)
					rows.push (row);
					this.squarify (children, rows, this.width());
				} else { 	
					currentRow = rows[rows.length - 1];
					if (this.worst(currentRow, this.width()) < this.worst(currentRow.addChild(c), this.width())) {		
						currentRow.popChild();
						x = 0;
						y = 0;
						if (this.w > this.h) {
							this.w -= currentRow.w;
							x = this.originW - this.w;
							y = this.originH - this.h;
						} else {
							this.h -= currentRow.h;
							x = this.originW - this.w;
							y = this.originH - this.h;
						}
						rows.push(this.layoutrow(c, x, y));
					} 
					this.squarify(children, rows, this.width());
				}
			}
		}
	},
	
	worst : function (row, w) {
		s = row.sumChildren();
		minC = row.children[row.children.length - 1].area;
		maxC = row.children[0].area;
		worst = Math.max( (w * w * maxC) / (s * s), (s * s) / (w * w * minC));
		return worst; 
	},
	
	layoutrow : function (c, x, y) {
		w = this.w - this.wf;
		h = this.h - this.hf;
		r = new Row(w, h, x, y);
		r.addChild(c);
		return r;
	},
	
	width : function () {
		return Math.min(this.w - this.wf, this.h - this.hf);
	}
}