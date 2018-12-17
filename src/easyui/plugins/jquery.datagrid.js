/**
 * datagrid - jQuery EasyUI
 * 
 * Licensed under the GPL:
 *   http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2010 stworthy [ stworthy@gmail.com ] 
 * 
 * Dependencies:
 * 	resizable
 * 	linkbutton
 * 	pagination
 * 
 */
(function($) {
	$.extend(Array.prototype, {
				indexOf : function(o) {
					for (var i = 0, len = this.length; i < len; i++) {
						if (this[i] == o) {
							return i;
						}
					}
					return -1;
				},
				remove : function(o) {
					var idx = this.indexOf(o);
					if (idx != -1) {
						this.splice(idx, 1);
					}
					return this;
				},
				removeById : function(field, id) {
					for (var i = 0, len = this.length; i < len; i++) {
						if (this[i][field] == id) {
							this.splice(i, 1);
							return this;
						}
					}
					return this;
				}
			});
	function setSize(target, param) {
		var opts = $.data(target, 'datagrid').options;
		var panel = $.data(target, 'datagrid').panel;
		if (param) {
			if (param.width) {
				opts.width = param.width;
			}
			if (param.height) {
				opts.height = param.height;
			}
		}
		if (opts.fit == true) {
			var p = panel.panel('panel').parent();
			opts.width = p.width();
			opts.height = p.height();
		}
		panel.panel('resize', {
					width : opts.width,
					height : opts.height
				});
	};
	function fitGridSize(target) {
		var opts = $.data(target, 'datagrid').options;
		var panel = $.data(target, 'datagrid').panel;
		var width = panel.width();
		var height = panel.height();
		var gridView = panel.children('div.datagrid-view');
		var gridView1 = gridView.children('div.datagrid-view1');
		var gridView2 = gridView.children('div.datagrid-view2');
		var gridHeader1 = gridView1.children('div.datagrid-header');
		var gridHeader2 = gridView2.children('div.datagrid-header');
		var gridTable1 = gridHeader1.find('table');
		var gridTable2 = gridHeader2.find('table');
		gridView.width(width);
		var innerHeader = gridHeader1.children('div.datagrid-header-inner').show();
		gridView1.width(innerHeader.find('table').width());
		if (!opts.showHeader) {
			innerHeader.hide();
		}
		gridView2.width(width - gridView1.outerWidth());
		gridView1
				.children('div.datagrid-header,div.datagrid-body,div.datagrid-footer')
				.width(gridView1.width());
		gridView2
				.children('div.datagrid-header,div.datagrid-body,div.datagrid-footer')
				.width(gridView2.width());
		var hh;
		gridHeader1.css('height', '');
		gridHeader2.css('height', '');
		gridTable1.css('height', '');
		gridTable2.css('height', '');
		hh = Math.max(gridTable1.height(), gridTable2.height());
		gridTable1.height(hh);
		gridTable2.height(hh);
		if ($.boxModel == true) {
			gridHeader1.height(hh - (gridHeader1.outerHeight() - gridHeader1.height()));
			gridHeader2.height(hh - (gridHeader2.outerHeight() - gridHeader2.height()));
		} else {
			gridHeader1.height(hh);
			gridHeader2.height(hh);
		}
		if (opts.height != 'auto') {
			var fixedHeight = height
					- gridView2.children('div.datagrid-header').outerHeight(true)
					- gridView2.children('div.datagrid-footer').outerHeight(true)
					- panel.children('div.datagrid-toolbar').outerHeight(true)
					- panel.children('div.datagrid-pager').outerHeight(true);
			gridView1.children('div.datagrid-body').height(fixedHeight);
			gridView2.children('div.datagrid-body').height(fixedHeight);
		}
		gridView.height(gridView2.height());
		gridView2.css('left', gridView1.outerWidth());
	};
	function fixRowHeight(target, rowIndex) {
		var rows = $.data(target, 'datagrid').data.rows;
		var opts = $.data(target, 'datagrid').options;
		var panel = $.data(target, 'datagrid').panel;
		var gridView = panel.children('div.datagrid-view');
		var gridView1 = gridView.children('div.datagrid-view1');
		var gridView2 = gridView.children('div.datagrid-view2');
		if (!gridView1.find('div.datagrid-body-inner').is(':empty')) {
			if (rowIndex >= 0) {
				alignRowHeight(rowIndex);
			} else {
				for (var i = 0; i < rows.length; i++) {
					alignRowHeight(i);
				}
				if (opts.showFooter) {
					var footerRows = $(target).datagrid('getFooterRows') || [];
					var c1 = gridView1.children('div.datagrid-footer');
					var c2 = gridView2.children('div.datagrid-footer');
					for (var i = 0; i < footerRows.length; i++) {
						alignRowHeight(i, c1, c2);
					}
					fitGridSize(target);
				}
			}
		}
		if (opts.height == 'auto') {
			var gridBody1 = gridView1.children('div.datagrid-body');
			var gridBody2 = gridView2.children('div.datagrid-body');
			var fullHeight = 0;
			var width = 0;
			gridBody2.children().each(function() {
						var c = $(this);
						if (c.is(':visible')) {
							fullHeight += c.outerHeight();
							if (width < c.outerWidth()) {
								width = c.outerWidth();
							}
						}
					});
			if (width > gridBody2.width()) {
				fullHeight += 18;
			}
			gridBody1.height(fullHeight);
			gridBody2.height(fullHeight);
			gridView.height(gridView2.height());
		}
		gridView2.children('div.datagrid-body').triggerHandler('scroll');
		function alignRowHeight(rowIndex, c1, c2) {
			c1 = c1 || gridView1;
			c2 = c2 || gridView2;
			var tr1 = c1.find('tr[datagrid-row-index=' + rowIndex + ']');
			var tr2 = c2.find('tr[datagrid-row-index=' + rowIndex + ']');
			tr1.css('height', '');
			tr2.css('height', '');
			var height = Math.max(tr1.height(), tr2.height());
			tr1.css('height', height);
			tr2.css('height', height);
		};
	};
	function wrapGrid(target, rownumbers) {
		function getColumns(thead) {
			var columns = [];
			$('tr', thead).each(function() {
				var cols = [];
				$('th', this).each(function() {
							var th = $(this);
							var col = {
								title : th.html(),
								align : th.attr('align') || 'left',
								sortable : th.attr('sortable') == 'true' || false,
								checkbox : th.attr('checkbox') == 'true' || false
							};
							if (th.attr('field')) {
								col.field = th.attr('field');
							}
							if (th.attr('formatter')) {
								col.formatter = eval(th.attr('formatter'));
							}
							if (th.attr('styler')) {
								col.styler = eval(th.attr('styler'));
							}
							if (th.attr('editor')) {
								var s = $.trim(th.attr('editor'));
								if (s.substr(0, 1) == '{') {
									col.editor = eval('(' + s + ')');
								} else {
									col.editor = s;
								}
							}
							if (th.attr('rowspan')) {
								col.rowspan = parseInt(th.attr('rowspan'));
							}
							if (th.attr('colspan')) {
								col.colspan = parseInt(th.attr('colspan'));
							}
							if (th.attr('width')) {
								col.width = parseInt(th.attr('width'));
							}
							if (th.attr('hidden')) {
								col.hidden = th.attr('hidden') == 'true';
							}
							if(th.attr('resizable')){
								col.resizable=th.attr('resizable')=='true';
							}
							cols.push(col);
						});
				columns.push(cols);
			});
			return columns;
		};
		var wrap = $('<div class="datagrid-wrap">'
				+ '<div class="datagrid-view">'
				+ '<div class="datagrid-view1">'
				+ '<div class="datagrid-header">'
				+ '<div class="datagrid-header-inner"></div>' + '</div>'
				+ '<div class="datagrid-body">'
				+ '<div class="datagrid-body-inner"></div>' + '</div>'
				+ '<div class="datagrid-footer">'
				+ '<div class="datagrid-footer-inner"></div>' + '</div>'
				+ '</div>' + '<div class="datagrid-view2">'
				+ '<div class="datagrid-header">'
				+ '<div class="datagrid-header-inner"></div>' + '</div>'
				+ '<div class="datagrid-body"></div>'
				+ '<div class="datagrid-footer">'
				+ '<div class="datagrid-footer-inner"></div>' + '</div>'
				+ '</div>' + '<div class="datagrid-resize-proxy"></div>'
				+ '</div>' + '</div>').insertAfter(target);
		wrap.panel({
					doSize : false
				});
		wrap.panel('panel').addClass('datagrid').bind('_resize',
				function(e, param) {
					var opts = $.data(target, 'datagrid').options;
					if (opts.fit == true || param) {
						setSize(target);
						setTimeout(function() {
									if ($.data(target, 'datagrid')) {
										fixColumnSize(target);
									}
								}, 0);
					}
					return false;
				});
		$(target).hide().appendTo(wrap.children('div.datagrid-view'));
		var frozenColumns = getColumns($('thead[frozen=true]', target));
		var columns = getColumns($('thead[frozen!=true]', target));
		return {
			panel : wrap,
			frozenColumns : frozenColumns,
			columns : columns
		};
	};
	function getGridData(target) {
		var data = {
			total : 0,
			rows : []
		};
		var fields = getColumnFields(target, true).concat(getColumnFields(target, false));
		$(target).find('tbody tr').each(function() {
					data.total++;
					var col = {};
					for (var i = 0; i < fields.length; i++) {
						col[fields[i]] = $('td:eq(' + i + ')', this).html();
					}
					data.rows.push(col);
				});
		return data;
	};
	function init(target) {
		var opts = $.data(target, 'datagrid').options;
		var panel = $.data(target, 'datagrid').panel;
		panel.panel($.extend({}, opts, {
					doSize : false,
					onResize : function(width, height) {
						setTimeout(function() {
									if ($.data(target, 'datagrid')) {
										fitGridSize(target);
										fitColumns(target);
										opts.onResize.call(panel, width, height);
									}
								}, 0);
					},
					onExpand : function() {
						fitGridSize(target);
						fixRowHeight(target);
						opts.onExpand.call(panel);
					}
				}));
		var gridView = panel.children('div.datagrid-view');
		var gridView1 = gridView.children('div.datagrid-view1');
		var gridView2 = gridView.children('div.datagrid-view2');
		var innerHeader1 = gridView1.children('div.datagrid-header')
				.children('div.datagrid-header-inner');
		var innerHeader2 = gridView2.children('div.datagrid-header')
				.children('div.datagrid-header-inner');
		buildGridHeader(innerHeader1, opts.frozenColumns, true);
		buildGridHeader(innerHeader2, opts.columns, false);
		innerHeader1.css('display', opts.showHeader ? 'block' : 'none');
		innerHeader2.css('display', opts.showHeader ? 'block' : 'none');
		gridView1.find('div.datagrid-footer-inner').css('display',
				opts.showFooter ? 'block' : 'none');
		gridView2.find('div.datagrid-footer-inner').css('display',
				opts.showFooter ? 'block' : 'none');
		//$('div.datagrid-toolbar', panel).remove();
		if (opts.toolbar) {
			if(typeof opts.toolbar == 'string'){
				$(opts.toolbar).addClass('datagrid-toolbar').prependTo(target);
				$(opts.toolbar).show();
			}else{
				$('div.datagrid-toolbar',panel).remove();
				var tb = $('<div class="datagrid-toolbar"></div>').prependTo(panel);
				for (var i = 0; i < opts.toolbar.length; i++) {
					var btn = opts.toolbar[i];
					if (btn == '-') {
						$('<div class="datagrid-btn-separator"></div>')
								.appendTo(tb);
					} else {
					var tool = $('<a href="javascript:void(0)" '+(btn.title?('title="'+btn.title+'"'):'')+'></a>');
						tool[0].onclick = eval(btn.handler || function() {
						});
						tool.css('float', 'left').appendTo(tb).linkbutton($.extend(
								{}, btn, {
									plain : true
								}));
					}
				}
			}
		}else{
			$('div.datagrid-toolbar',panel).remove();
		}
		$('div.datagrid-pager', panel).remove();
		if (opts.pagination) {
			var pager = $('<div class="datagrid-pager"></div>').appendTo(panel);
			pager.pagination({
						pageNumber : opts.pageNumber,
						pageSize : opts.pageSize,
						pageList : opts.pageList,
						onSelectPage : function(pageNumber, pageSize) {
							opts.pageNumber = pageNumber;
							opts.pageSize = pageSize;
							request(target);
						}
					});
			opts.pageSize = pager.pagination('options').pageSize;
		}
		function buildGridHeader(header, columns, frozen) {
			if (!columns) {
				return;
			}
			$(header).show();
			$(header).empty();
			var t = $('<table border="0" cellspacing="0" cellpadding="0"><tbody></tbody></table>')
					.appendTo(header);
			for (var i = 0; i < columns.length; i++) {
				var tr = $('<tr></tr>').appendTo($('tbody', t));
				var column = columns[i];
				for (var j = 0; j < column.length; j++) {
					var col = column[j];
					var tdHTML = '';
					if (col.rowspan) {
						tdHTML += 'rowspan="' + col.rowspan + '" ';
					}
					if (col.colspan) {
						tdHTML += 'colspan="' + col.colspan + '" ';
					}
					var td = $('<td ' + tdHTML + '></td>').appendTo(tr);
					if (col.checkbox) {
						td.attr('field', col.field);
						$('<div class="datagrid-header-check"></div>')
								.html('<input type="checkbox"/>')
								.appendTo(td);
					} else {
						if (col.field) {
							td.attr('field', col.field);
							td
									.append('<div class="datagrid-cell"><span></span><span class="datagrid-sort-icon"></span></div>');
							$('span', td).html(col.title);
							$('span.datagrid-sort-icon', td).html('&nbsp;');
							var cell = td.find('div.datagrid-cell');
							if(col.resizable==false){
								cell.attr('resizable','false');
							}
							col.boxWidth = $.boxModel ? (col.width - (cell
									.outerWidth() - cell.width())) : col.width;
							cell.width(col.boxWidth);
							cell.css('text-align', (col.align || 'left'));
						} else {
							$('<div class="datagrid-cell-group"></div>')
									.html(col.title).appendTo(td);
						}
					}
					if (col.hidden) {
						td.hide();
					}
				}
			}
			if (frozen && opts.rownumbers) {
				var td = $('<td rowspan="'
						+ opts.frozenColumns.length
						+ '"><div class="datagrid-header-rownumber"></div></td>');
				if ($('tr', t).length == 0) {
					td.wrap('<tr></tr>').parent().appendTo($('tbody', t));
				} else {
					td.prependTo($('tr:first', t));
				}
			}
		};
	};
	function resetGridEvent(target) {
		var panel = $.data(target, 'datagrid').panel;
		var opts = $.data(target, 'datagrid').options;
		var data = $.data(target, 'datagrid').data;
		var gridBody = panel.find('div.datagrid-body');
		gridBody.find('tr[datagrid-row-index]').unbind('.datagrid').bind(
				'mouseenter.datagrid', function() {
					var rowIndex = $(this).attr('datagrid-row-index');
					gridBody.find('tr[datagrid-row-index=' + rowIndex + ']')
							.addClass('datagrid-row-over');
				}).bind('mouseleave.datagrid', function() {
			var rowIndex = $(this).attr('datagrid-row-index');
			gridBody.find('tr[datagrid-row-index=' + rowIndex + ']')
					.removeClass('datagrid-row-over');
		}).bind('click.datagrid', function() {
					var rowIndex = $(this).attr('datagrid-row-index');
					if (opts.singleSelect == true) {
						clearSelections(target);
						selectRow(target, rowIndex);
					} else {
						if ($(this).hasClass('datagrid-row-selected')) {
							unselectRow(target, rowIndex);
						} else {
							selectRow(target, rowIndex);
						}
					}
					if (opts.onClickRow) {
						opts.onClickRow.call(target, rowIndex, data.rows[rowIndex]);
					}
				}).bind('dblclick.datagrid', function() {
					var rowIndex = $(this).attr('datagrid-row-index');
					if (opts.onDblClickRow) {
						opts.onDblClickRow.call(target, rowIndex, data.rows[rowIndex]);
					}
				}).bind('contextmenu.datagrid', function(e) {
					var rowIndex = $(this).attr('datagrid-row-index');
					if (opts.onRowContextMenu) {
						opts.onRowContextMenu.call(target, e, rowIndex, data.rows[rowIndex]);
					}
				});
		gridBody.find('td[field]').unbind('.datagrid').bind('click.datagrid',
				function() {
					var rowIndex = $(this).parent().attr('datagrid-row-index');
					var field = $(this).attr("field");
					var value = data.rows[rowIndex][field];
					opts.onClickCell.call(target, rowIndex, field, value);
				}).bind('dblclick.datagrid', function() {
					var rowIndex = $(this).parent().attr('datagrid-row-index');
					var field = $(this).attr('field');
					var value = data.rows[rowIndex][field];
					opts.onDblClickCell.call(target, rowIndex, field, value);
				});
		gridBody.find('div.datagrid-cell-check input[type=checkbox]')
				.unbind('.datagrid').bind('click.datagrid', function(e) {
					var rowIndex = $(this).parent().parent().parent()
							.attr('datagrid-row-index');
					if (opts.singleSelect) {
						clearSelections(target);
						selectRow(target, rowIndex);
					} else {
						if ($(this).attr('checked')) {
							selectRow(target, rowIndex);
						} else {
							unselectRow(target, rowIndex);
						}
					}
					e.stopPropagation();
				});
	};
	function setProperties(target) {
		var panel = $.data(target, 'datagrid').panel;
		var opts = $.data(target, 'datagrid').options;
		var gridHeader = panel.find('div.datagrid-header');
		gridHeader.find('td:has(div.datagrid-cell)').unbind('.datagrid').bind(
				'mouseenter.datagrid', function() {
					$(this).addClass('datagrid-header-over');
				}).bind('mouseleave.datagrid', function() {
					$(this).removeClass('datagrid-header-over');
				}).bind('contextmenu.datagrid', function(e) {
					var field = $(this).attr('field');
					opts.onHeaderContextMenu.call(target, e, field);
				});
		gridHeader.find('div.datagrid-cell').unbind('.datagrid').bind(
				'click.datagrid', function() {
					var field = $(this).parent().attr('field');
					var opt = getColumnOption(target, field);
					if (!opt.sortable) {
						return;
					}
					opts.sortName = field;
					opts.sortOrder = 'asc';
					var c = 'datagrid-sort-asc';
					if ($(this).hasClass('datagrid-sort-asc')) {
						c = 'datagrid-sort-desc';
						opts.sortOrder = 'desc';
					}
					gridHeader
							.find('div.datagrid-cell')
							.removeClass('datagrid-sort-asc datagrid-sort-desc');
					$(this).addClass(c);
					if (opts.remoteSort) {
						request(target);
					} else {
						var data = $.data(target, 'datagrid').data;
						renderGrid(target, data);
					}
					if (opts.onSortColumn) {
						opts.onSortColumn.call(target, opts.sortName, opts.sortOrder);
					}
				});
		gridHeader.find('input[type=checkbox]').unbind('.datagrid').bind(
				'click.datagrid', function() {
					if (opts.singleSelect) {
						return false;
					}
					if ($(this).attr('checked')) {
						selectAll(target);
					} else {
						unselectAll(target);
					}
				});
		var gridView = panel.children('div.datagrid-view');
		var gridView1 = gridView.children('div.datagrid-view1');
		var gridView2 = gridView.children('div.datagrid-view2');
		gridView2.children('div.datagrid-body').unbind('.datagrid').bind(
				'scroll.datagrid', function() {
					gridView1.children('div.datagrid-body').scrollTop($(this)
							.scrollTop());
					gridView2.children('div.datagrid-header').scrollLeft($(this)
							.scrollLeft());
					gridView2.children('div.datagrid-footer').scrollLeft($(this)
							.scrollLeft());
				});
		gridHeader.find('div.datagrid-cell').each(function() {
			$(this).resizable({
				handles : 'e',
				disabled : ($(this).attr('resizable') ? $(this)
						.attr('resizable') == 'false' : false),
				minWidth : 25,
				onStartResize : function(e) {
					gridView.children('div.datagrid-resize-proxy').css({
								left : e.pageX - $(panel).offset().left - 1,
								display : 'block'
							});
					//proxy.css('display', 'block');
				},
				onResize : function(e) {
					gridView.children('div.datagrid-resize-proxy').css({
								display : 'block',
								left : e.pageX - $(panel).offset().left - 1
							});
					return false;
				},
				onStopResize : function(e) {
					var field = $(this).parent().attr('field');
					var col = getColumnOption(target, field);
					col.width = $(this).outerWidth();
					col.boxWidth = $.boxModel == true ? $(this).width() : $(this)
							.outerWidth();
					fixColumnSize(target, field);
					fitColumns(target);
					var gridView2 = panel.find('div.datagrid-view2');
					gridView2.find('div.datagrid-header').scrollLeft(gridView2
							.find('div.datagrid-body').scrollLeft());
					gridView.children('div.datagrid-resize-proxy')
							.css('display', 'none');
					opts.onResizeColumn.call(target, field, col.width);
				}
			});
		});
		gridView1.children('div.datagrid-header').find('div.datagrid-cell').resizable({
			onStopResize : function(e) {
				var field = $(this).parent().attr('field');
				var col = getColumnOption(target, field);
				col.width = $(this).outerWidth();
				col.boxWidth = $.boxModel == true ? $(this).width() : $(this)
						.outerWidth();
				fixColumnSize(target, field);
				var gridView2 = panel.find('div.datagrid-view2');
				gridView2.find('div.datagrid-header').scrollLeft(gridView2
						.find('div.datagrid-body').scrollLeft());
				gridView.children('div.datagrid-resize-proxy')
						.css('display', 'none');
				fitGridSize(target);
				fitColumns(target);
				opts.onResizeColumn.call(target, field, col.width);
			}
		});
	};
	function fitColumns(target) {
		var opts = $.data(target, 'datagrid').options;
		if (!opts.fitColumns) {
			return;
		}
		var panel = $.data(target, 'datagrid').panel;
		var gridHeader2 = panel.find('div.datagrid-view2 div.datagrid-header');
		var visableWidth = 0;
		var visableColumn;
		var fields = getColumnFields(target, false);
		for (var i = 0; i < fields.length; i++) {
			var col = getColumnOption(target, fields[i]);
			if (!col.hidden && !col.checkbox) {
				visableWidth += col.width;
				visableColumn = col;
			}
		}
		var innerHeader = gridHeader2.children('div.datagrid-header-inner').show();
		var fullWidth = gridHeader2.width() - gridHeader2.find('table').width() - opts.scrollbarSize;
		var rate = fullWidth/visableWidth;
		if (!opts.showHeader) {
			innerHeader.hide();
		}
		for (var i = 0; i < fields.length; i++) {
			var col = getColumnOption(target, fields[i]);
			if(!col.hidden&&!col.checkbox){
				var width = Math.floor(col.width * rate);
				fitColumnWidth(col, width);
				fullWidth-=width;
			}
		}
		fixColumnSize(target);
		
		if (fullWidth) {
			fitColumnWidth(visableColumn, fullWidth);
			
			fixColumnSize(target, visableColumn.field);
		}
		function fitColumnWidth(col, width) {
			col.width += width;
			col.boxWidth += width;
			gridHeader2.find('td[field=' + col.field + '] div.datagrid-cell')
					.width(col.boxWidth);
		};
	};
	function fixColumnSize(target, cell) {
		var panel = $.data(target, 'datagrid').panel;
		var footer = panel.find('div.datagrid-body,div.datagrid-footer');
		if (cell) {
			fix(cell);
		} else {
			panel.find('div.datagrid-header td[field]').each(function() {
						fix($(this).attr('field'));
					});
		}
		fixMergedCellsSize(target);
		setTimeout(function() {
					fixRowHeight(target);
					fixEditorSize(target);
				}, 0);
		function fix(cell) {
			var col = getColumnOption(target, cell);
			footer.find('td[field=' + cell + ']').each(function() {
						var td = $(this);
						var colspan = td.attr('colspan') || 1;
						if (colspan == 1) {
							td.find('div.datagrid-cell').width(col.boxWidth);
							td.find('div.datagrid-editable').width(col.width);
						}
					});
		};
	};
	function fixMergedCellsSize(target) {
		var panel = $.data(target, 'datagrid').panel;
		var gridHeader = panel.find('div.datagrid-header');
		panel.find('div.datagrid-body td.datagrid-td-merged').each(function() {
					var td = $(this);
					var colspan = td.attr('colspan') || 1;
					var field = td.attr('field');
					var tdEl = gridHeader.find('td[field=' + field + ']');
					var width = tdEl.width();
					for (var i = 1; i < colspan; i++) {
						tdEl = tdEl.next();
						width += tdEl.outerWidth();
					}
					var cell = td.children('div.datagrid-cell');
					if ($.boxModel == true) {
						cell.width(width - (cell.outerWidth() - cell.width()));
					} else {
						cell.width(width);
					}
				});
	};
	function fixEditorSize(target) {
		var panel = $.data(target, 'datagrid').panel;
		panel.find('div.datagrid-editable').each(function() {
					var ed = $.data(this, 'datagrid.editor');
					if (ed.actions.resize) {
						ed.actions.resize(ed.target, $(this).width());
					}
				});
	};
	function getColumnOption(target, field) {
		var opts = $.data(target, 'datagrid').options;
		if (opts.columns) {
			for (var i = 0; i < opts.columns.length; i++) {
				var columns = opts.columns[i];
				for (var j = 0; j < columns.length; j++) {
					var col = columns[j];
					if (col.field == field) {
						return col;
					}
				}
			}
		}
		if (opts.frozenColumns) {
			for (var i = 0; i < opts.frozenColumns.length; i++) {
				var columns = opts.frozenColumns[i];
				for (var j = 0; j < columns.length; j++) {
					var col = columns[j];
					if (col.field == field) {
						return col;
					}
				}
			}
		}
		return null;
	};
	function getColumnFields(target, frozen) {
		var opts = $.data(target, 'datagrid').options;
		var columns = (frozen == true) ? (opts.frozenColumns || [[]]) : opts.columns;
		if (columns.length == 0) {
			return [];
		}
		var fields = [];
		function getFixedColspan(index) {
			var c = 0;
			var i = 0;
			while (true) {
				if (fields[i] == undefined) {
					if (c == index) {
						return i;
					}
					c++;
				}
				i++;
			}
		};
		function findColumnFields(r) {
			var ff = [];
			var c = 0;
			for (var i = 0; i < columns[r].length; i++) {
				var col = columns[r][i];
				if (col.field) {
					ff.push([c, col.field]);
				}
				c += parseInt(col.colspan || '1');
			}
			for (var i = 0; i < ff.length; i++) {
				ff[i][0] = getFixedColspan(ff[i][0]);
			}
			for (var i = 0; i < ff.length; i++) {
				var f = ff[i];
				fields[f[0]] = f[1];
			}
		};
		for (var i = 0; i < columns.length; i++) {
			findColumnFields(i);
		}
		return fields;
	};
	function renderGrid(target, data) {
		var opts = $.data(target, 'datagrid').options;
		var panel = $.data(target, 'datagrid').panel;
		var selectedRows = $.data(target, 'datagrid').selectedRows;
		data = opts.loadFilter.call(target,data);
		var rows = data.rows;
		$.data(target, 'datagrid').data = data;
		if (data.footer) {
			$.data(target, 'datagrid').footer = data.footer;
		}
		if (!opts.remoteSort) {
			var opt = getColumnOption(target, opts.sortName);
			if (opt) {
				var sorter = opt.sorter || function(a, b) {
					return (a > b ? 1 : -1);
				};
				data.rows.sort(function(r1, r2) {
							return sorter(r1[opts.sortName], r2[opts.sortName])
									* (opts.sortOrder == 'asc' ? 1 : -1);
						});
			}
		}
		var gridView = panel.children('div.datagrid-view');
		var gridView1 = gridView.children('div.datagrid-view1');
		var gridView2 = gridView.children('div.datagrid-view2');
		if (opts.view.onBeforeRender) {
			opts.view.onBeforeRender.call(opts.view, target, rows);
		}
		opts.view.render.call(opts.view, target, gridView2.children('div.datagrid-body'),
				false);
		opts.view.render.call(opts.view, target, gridView1.children('div.datagrid-body')
						.children('div.datagrid-body-inner'), true);
		if (opts.showFooter) {
			opts.view.renderFooter.call(opts.view, target, gridView2
							.find('div.datagrid-footer-inner'), false);
			opts.view.renderFooter.call(opts.view, target, gridView1
							.find('div.datagrid-footer-inner'), true);
		}
		if (opts.view.onAfterRender) {
			opts.view.onAfterRender.call(opts.view, target);
		}
		opts.onLoadSuccess.call(target, data);
		var pager = panel.children('div.datagrid-pager');
		if (pager.length) {
			if (pager.pagination('options').total != data.total) {
				pager.pagination({
							total : data.total
						});
			}
		}
		fixRowHeight(target);
		resetGridEvent(target);
		gridView2.children('div.datagrid-body').triggerHandler('scroll');
		if (opts.idField) {
			for (var i = 0; i < rows.length; i++) {
				if (isSelected(rows[i])) {
					selectRecord(target, rows[i][opts.idField]);
				}
			}
		}
		function isSelected(row) {
			for (var i = 0; i < selectedRows.length; i++) {
				if (selectedRows[i][opts.idField] == row[opts.idField]) {
					selectedRows[i] = row;
					return true;
				}
			}
			return false;
		};
	};
	function getRowIndex(target, row) {
		var opts = $.data(target, 'datagrid').options;
		var rows = $.data(target, 'datagrid').data.rows;
		if (typeof row == 'object') {
			return rows.indexOf(row);
		} else {
			for (var i = 0; i < rows.length; i++) {
				if (rows[i][opts.idField] == row) {
					return i;
				}
			}
			return -1;
		}
	};
	function getSelected(target) {
		var opts = $.data(target, 'datagrid').options;
		var panel = $.data(target, 'datagrid').panel;
		var data = $.data(target, 'datagrid').data;
		if (opts.idField) {
			return $.data(target, 'datagrid').selectedRows;
		} else {
			var rowIndexs = [];
			$('div.datagrid-view2 div.datagrid-body tr.datagrid-row-selected',
					panel).each(function() {
						var rowIndex = parseInt($(this).attr('datagrid-row-index'));
						rowIndexs.push(data.rows[rowIndex]);
					});
			return rowIndexs;
		}
	};
	function clearSelections(target) {
		unselectAll(target);
		var selectedRows = $.data(target, 'datagrid').selectedRows;
		selectedRows.splice(0, selectedRows.length);
	};
	function selectAll(target) {
		var opts = $.data(target, 'datagrid').options;
		var panel = $.data(target, 'datagrid').panel;
		var data = $.data(target, 'datagrid').data;
		var selectedRows = $.data(target, 'datagrid').selectedRows;
		var rows = data.rows;
		var gridBody = panel.find('div.datagrid-body');
		gridBody.find('tr').addClass('datagrid-row-selected');
		var checkbox=gridBody.find('div.datagrid-cell-check input[type=checkbox]');
		$.fn.prop?checkbox.prop('checked',true):checkbox.attr('checked',true);
		for (var rowIndex = 0; rowIndex < rows.length; rowIndex++) {
			if (opts.idField) {
				(function() {
					var row = rows[rowIndex];
					for (var i = 0; i < selectedRows.length; i++) {
						if (selectedRows[i][opts.idField] == row[opts.idField]) {
							return;
						}
					}
					selectedRows.push(row);
				})();
			}
		}
		opts.onSelectAll.call(target, rows);
	};
	function unselectAll(target) {
		var opts = $.data(target, 'datagrid').options;
		var panel = $.data(target, 'datagrid').panel;
		var data = $.data(target, 'datagrid').data;
		var selectedRows = $.data(target, 'datagrid').selectedRows;
		var checkbox=panel.find('div.datagrid-body div.datagrid-cell-check input[type=checkbox]');
		$.fn.prop?checkbox.prop('checked',false):checkbox.attr('checked',false);
		$('div.datagrid-body tr.datagrid-row-selected',panel).removeClass('datagrid-row-selected');
		if (opts.idField) {
			for (var rowIndex = 0; rowIndex < data.rows.length; rowIndex++) {
				selectedRows.removeById(opts.idField, data.rows[rowIndex][opts.idField]);
			}
		}
		opts.onUnselectAll.call(target, data.rows);
	};
	function selectRow(target, rowIndex) {
		var panel = $.data(target, 'datagrid').panel;
		var opts = $.data(target, 'datagrid').options;
		var data = $.data(target, 'datagrid').data;
		var selectedRows = $.data(target, 'datagrid').selectedRows;
		if (rowIndex < 0 || rowIndex >= data.rows.length) {
			return;
		}
		if (opts.singleSelect == true) {
			clearSelections(target);
		}
		var tr = $('div.datagrid-body tr[datagrid-row-index=' + rowIndex + ']', panel);
		if (!tr.hasClass('datagrid-row-selected')) {
			tr.addClass('datagrid-row-selected');
			var ck = $('div.datagrid-cell-check input[type=checkbox]', tr);
			$.fn.prop?ck.prop('checked',true):ck.attr('checked',true);
			if (opts.idField) {
				var row = data.rows[rowIndex];
				(function() {
					for (var i = 0; i < selectedRows.length; i++) {
						if (selectedRows[i][opts.idField] == row[opts.idField]) {
							return;
						}
					}
					selectedRows.push(row);
				})();
			}
		}
		opts.onSelect.call(target, rowIndex, data.rows[rowIndex]);
		var gridView2 = panel.find('div.datagrid-view2');
		var height = gridView2.find('div.datagrid-header').outerHeight();
		var gridBody = gridView2.find('div.datagrid-body');
		var top = tr.position().top - height;
		if (top <= 0) {
			gridBody.scrollTop(gridBody.scrollTop() + top);
		} else {
			if (top + tr.outerHeight() > gridBody.height() - 18) {
				gridBody.scrollTop(gridBody.scrollTop() + top + tr.outerHeight()
						- gridBody.height() + 18);
			}
		}
	};
	function selectRecord(target, id) {
		var opts = $.data(target, 'datagrid').options;
		var data = $.data(target, 'datagrid').data;
		if (opts.idField) {
			var index = -1;
			for (var i = 0; i < data.rows.length; i++) {
				if (data.rows[i][opts.idField] == id) {
					index = i;
					break;
				}
			}
			if (index >= 0) {
				selectRow(target, index);
			}
		}
	};
	function unselectRow(target, rowIndex) {
		var opts = $.data(target, 'datagrid').options;
		var panel = $.data(target, 'datagrid').panel;
		var data = $.data(target, 'datagrid').data;
		var selectedRows = $.data(target, 'datagrid').selectedRows;
		if (rowIndex < 0 || rowIndex >= data.rows.length) {
			return;
		}
		var gridBody = panel.find('div.datagrid-body');
		var tr = $('tr[datagrid-row-index=' + rowIndex + ']', gridBody);
		var ck = $('tr[datagrid-row-index=' + rowIndex
						+ '] div.datagrid-cell-check input[type=checkbox]', gridBody);
		tr.removeClass('datagrid-row-selected');
		$.fn.prop?ck.prop('checked',false):ck.attr('checked',false);
		var row = data.rows[rowIndex];
		if (opts.idField) {
			selectedRows.removeById(opts.idField, row[opts.idField]);
		}
		opts.onUnselect.call(target, rowIndex, row);
	};
	function beginEdit(target, rowIndex) {
		var opts = $.data(target, 'datagrid').options;
		var tr = opts.editConfig.getTr(target, rowIndex);
		var row = opts.editConfig.getRow(target, rowIndex);
		if (tr.hasClass('datagrid-row-editing')) {
			return;
		}
		if (opts.onBeforeEdit.call(target, rowIndex, row) == false) {
			return;
		}
		tr.addClass('datagrid-row-editing');
		createEditor(target, rowIndex);
		fixEditorSize(target);
		tr.find('div.datagrid-editable').each(function() {
					var field = $(this).parent().attr('field');
					var ed = $.data(this, 'datagrid.editor');
					ed.actions.setValue(ed.target, row[field]);
				});
		validateRow(target, rowIndex);
	};
	function stopEdit(target, rowIndex, revert) {
		var opts = $.data(target, 'datagrid').options;
		var updatedRows = $.data(target, 'datagrid').updatedRows;
		var insertedRows = $.data(target, 'datagrid').insertedRows;
		var tr = opts.editConfig.getTr(target, rowIndex);
		var row = opts.editConfig.getRow(target, rowIndex);
		if (!tr.hasClass('datagrid-row-editing')) {
			return;
		}
		if (!revert) {
			if (!validateRow(target, rowIndex)) {
				return;
			}
			var changed = false;
			var newValues = {};
			tr.find('div.datagrid-editable').each(function() {
				var field = $(this).parent().attr('field');
				var ed = $.data(this, 'datagrid.editor');
				var value = ed.actions.getValue(ed.target);
				if (row[field] != value) {
					row[field] = value;
					changed = true;
					newValues[field] = value;
				}
			});
			if (changed) {
				if (insertedRows.indexOf(row) == -1) {
					if (updatedRows.indexOf(row) == -1) {
						updatedRows.push(row);
					}
				}
			}
		}
		tr.removeClass('datagrid-row-editing');
		destroyEditor(target, rowIndex);
		$(target).datagrid('refreshRow', rowIndex);
		if (!revert) {
			opts.onAfterEdit.call(target, rowIndex, row, newValues);
		} else {
			opts.onCancelEdit.call(target, rowIndex, row);
		}
	};
	function getEditors(target, rowIndex) {
		var opts=$.data(target,'datagrid').options;
		var tr=opts.editConfig.getTr(target,rowIndex);
		var editors = [];
		tr.children('td').each(function() {
					var cell = $(this).find('div.datagrid-editable');
					if (cell.length) {
						var ed = $.data(cell[0], 'datagrid.editor');
						editors.push(ed);
					}
				});
		return editors;
	};
	function getEditor(target, options) {
		var editors = getEditors(target, options.index);
		for (var i = 0; i < editors.length; i++) {
			if (editors[i].field == options.field) {
				return editors[i];
			}
		}
		return null;
	};
	function createEditor(target, rowIndex) {
		var opts = $.data(target, 'datagrid').options;
		var tr = opts.editConfig.getTr(target, rowIndex);
		tr.children('td').each(function() {
			var cell = $(this).find('div.datagrid-cell');
			var field = $(this).attr('field');
			var col = getColumnOption(target, field);
			if (col && col.editor) {
				var type, editorOpts;
				if (typeof col.editor == 'string') {
					type = col.editor;
				} else {
					type = col.editor.type;
					editorOpts = col.editor.options;
				}
				var editor = opts.editors[type];
				if (editor) {
					var html = cell.html();
					var width = cell.outerWidth();
					cell.addClass('datagrid-editable');
					if ($.boxModel == true) {
						cell.width(width - (cell.outerWidth() - cell.width()));
					}
					cell
							.html('<table border="0" cellspacing="0" cellpadding="1"><tr><td></td></tr></table>');
					cell.children('table').attr('align', col.align);
					cell.children('table').bind('click dblclick contextmenu',
						function(e){
							e.stopPropagation();
						});;
					$.data(cell[0], 'datagrid.editor', {
								actions : editor,
								target : editor.init(cell.find('td'), editorOpts),
								field : field,
								type : type,
								oldHtml : html
							});
				}
			}
		});
		fixRowHeight(target, rowIndex);
	};
	function destroyEditor(target, rowIndex) {
		var opts = $.data(target, 'datagrid').options;
		var tr = opts.editConfig.getTr(target, rowIndex);				
		tr.children('td').each(function() {
					var cell = $(this).find('div.datagrid-editable');
					if (cell.length) {
						var ed = $.data(cell[0], 'datagrid.editor');
						if (ed.actions.destroy) {
							ed.actions.destroy(ed.target);
						}
						$.removeData(cell[0], 'datagrid.editor');
						var width = cell.outerWidth();
						cell.removeClass('datagrid-editable');
						if ($.boxModel == true) {
							cell.width(width
									- (cell.outerWidth() - cell.width()));
						}
					}
				});
	};
	function validateRow(target, rowIndex) {
		var tr = $.data(target, 'datagrid').options.editConfig.getTr(target, rowIndex);
		if (!tr.hasClass('datagrid-row-editing')) {
			return true;
		}
		var vbox = tr.find('.validatebox-text');
		vbox.validatebox('validate');
		vbox.trigger('mouseleave');
		var invalid = tr.find('.validatebox-invalid');
		return invalid.length == 0;
	};
	function getChanges(target, type) {
		var insertedRows = $.data(target, 'datagrid').insertedRows;
		var deletedRows = $.data(target, 'datagrid').deletedRows;
		var updatedRows = $.data(target, 'datagrid').updatedRows;
		if (!type) {
			var rows = [];
			rows = rows.concat(insertedRows);
			rows = rows.concat(deletedRows);
			rows = rows.concat(updatedRows);
			return rows;
		} else {
			if (type == 'inserted') {
				return insertedRows;
			} else {
				if (type == 'deleted') {
					return deletedRows;
				} else {
					if (type == 'updated') {
						return updatedRows;
					}
				}
			}
		}
		return [];
	};
	function deleteRow(target, rowIndex) {
		var opts = $.data(target, 'datagrid').options;
		var data = $.data(target, 'datagrid').data;
		var insertedRows = $.data(target, 'datagrid').insertedRows;
		var deletedRows = $.data(target, 'datagrid').deletedRows;
		var selectedRows = $.data(target, 'datagrid').selectedRows;
		$(target).datagrid('cancelEdit', rowIndex);
		var row = data.rows[rowIndex];
		if (insertedRows.indexOf(row) >= 0) {
			insertedRows.remove(row);
		} else {
			deletedRows.push(row);
		}
		selectedRows.removeById(opts.idField, row[opts.idField]);
		opts.view.deleteRow.call(opts.view, target, rowIndex);
		if (opts.height == 'auto') {
			fixRowHeight(target);
		}
	};
	function insertRow(target, param) {
		var view = $.data(target, 'datagrid').options.view;
		var insertedRows = $.data(target, 'datagrid').insertedRows;
		view.insertRow.call(view, target, param.index, param.row);
		resetGridEvent(target);
		insertedRows.push(param.row);
	};
	function appendRow(target, row) {
		var view = $.data(target, 'datagrid').options.view;
		var insertedRows = $.data(target, 'datagrid').insertedRows;
		view.insertRow.call(view, target, null, row);
		resetGridEvent(target);
		insertedRows.push(row);
	};
	function resetOperation(target) {
		var data = $.data(target, 'datagrid').data;
		var rows = data.rows;
		var originalRows = [];
		for (var i = 0; i < rows.length; i++) {
			originalRows.push($.extend({}, rows[i]));
		}
		$.data(target, 'datagrid').originalRows = originalRows;
		$.data(target, 'datagrid').updatedRows = [];
		$.data(target, 'datagrid').insertedRows = [];
		$.data(target, 'datagrid').deletedRows = [];
	};
	function acceptChanges(target) {
		var data = $.data(target, 'datagrid').data;
		var ok = true;
		for (var i = 0, len = data.rows.length; i < len; i++) {
			if (validateRow(target, i)) {
				stopEdit(target, i, false);
			} else {
				ok = false;
			}
		}
		if (ok) {
			resetOperation(target);
		}
	};
	function rejectChanges(target) {
		var opts = $.data(target, 'datagrid').options;
		var originalRows = $.data(target, 'datagrid').originalRows;
		var insertedRows = $.data(target, 'datagrid').insertedRows;
		var deletedRows = $.data(target, 'datagrid').deletedRows;
		var selectedRows = $.data(target, 'datagrid').selectedRows;
		var data = $.data(target, 'datagrid').data;
		for (var i = 0; i < data.rows.length; i++) {
			stopEdit(target, i, true);
		}
		var records = [];
		for (var i = 0; i < selectedRows.length; i++) {
			records.push(selectedRows[i][opts.idField]);
		}
		selectedRows.splice(0, selectedRows.length);
		data.total += deletedRows.length - insertedRows.length;
		data.rows = originalRows;
		renderGrid(target, data);
		for (var i = 0; i < records.length; i++) {
			selectRecord(target, records[i]);
		}
		resetOperation(target);
	};
	function request(target, param) {
		var panel = $.data(target, 'datagrid').panel;
		var opts = $.data(target, 'datagrid').options;
		if (param) {
			opts.queryParams = param;
		}
		if (!opts.url) {
			return;
		}
		param = $.extend({}, opts.queryParams);
		if (opts.pagination) {
			$.extend(param, {
						page : opts.pageNumber,
						rows : opts.pageSize
					});
		}
		if (opts.sortName) {
			$.extend(param, {
						sort : opts.sortName,
						order : opts.sortOrder
					});
		}
		if (opts.onBeforeLoad.call(target, param) == false) {
			return;
		}
		//showLoadingMask();
		$(target).datagrid('loading');
		setTimeout(function() {
					doRequest();
				}, 0);
		function doRequest() {
			$.ajax({
						type : opts.method,
						url : opts.url,
						data : param,
						dataType : 'json',
						success : function(data) {
							setTimeout(function() {
										//hideLoadingMask();
										$(target).datagrid('loaded');
									}, 0);
							renderGrid(target, data);
							setTimeout(function() {
										resetOperation(target);
									}, 0);
						},
						error : function() {
							setTimeout(function() {
										//hideLoadingMask();
										$(target).datagrid('loaded');
									}, 0);
							if (opts.onLoadError) {
								opts.onLoadError.apply(target, arguments);
							}
						}
					});
		};
	};
	function mergeCells(target, options) {
		var rows = $.data(target, 'datagrid').data.rows;
		var panel = $.data(target, 'datagrid').panel;
		options.rowspan = options.rowspan || 1;
		options.colspan = options.colspan || 1;
		if (options.index < 0 || options.index >= rows.length) {
			return;
		}
		if (options.rowspan == 1 && options.colspan == 1) {
			return;
		}
		var field = rows[options.index][options.field];
		var tr = panel.find('div.datagrid-body tr[datagrid-row-index='
				+ options.index + ']');
		var td = tr.find('td[field=' + options.field + ']');
		td.attr('rowspan', options.rowspan).attr('colspan', options.colspan);
		td.addClass('datagrid-td-merged');
		for (var i = 1; i < options.colspan; i++) {
			td = td.next();
			td.hide();
			rows[options.index][td.attr('field')] = field;
		}
		for (var i = 1; i < options.rowspan; i++) {
			tr = tr.next();
			var td = tr.find('td[field=' + options.field + ']').hide();
			rows[options.index + i][td.attr('field')] = field;
			for (var j = 1; j < options.colspan; j++) {
				td = td.next();
				td.hide();
				rows[options.index + i][td.attr('field')] = field;
			}
		}
		setTimeout(function() {
					fixMergedCellsSize(target);
				}, 0);
	};
	$.fn.datagrid = function(options, param) {
		if (typeof options == 'string') {
			return $.fn.datagrid.methods[options](this, param);
		}
		options = options || {};
		return this.each(function() {
					var state = $.data(this, 'datagrid');
					var opts;
					if (state) {
						opts = $.extend(state.options, options);
						state.options = opts;
					} else {
						opts = $.extend({}, $.fn.datagrid.defaults,
								$.fn.datagrid.parseOptions(this), options);
						$(this).css('width', '').css('height', '');
						var gridWrap = wrapGrid(this, opts.rownumbers);
						if (!opts.columns) {
							opts.columns = gridWrap.columns;
						}
						if (!opts.frozenColumns) {
							opts.frozenColumns = gridWrap.frozenColumns;
						}
						$.data(this, 'datagrid', {
									options : opts,
									panel : gridWrap.panel,
									selectedRows : [],
									data : {
										total : 0,
										rows : []
									},
									originalRows : [],
									updatedRows : [],
									insertedRows : [],
									deletedRows : []
								});
					}
					init(this);
					if (!state) {
						var data = getGridData(this);
						if (data.total > 0) {
							renderGrid(this, data);
							resetOperation(this);
						}
					}
					setSize(this);
					if (opts.url) {
						request(this);
					}
					setProperties(this);
				});
	};
	var editors = {
		text : {
			init : function(container, options) {
				var editor = $('<input type="text" class="datagrid-editable-input">')
						.appendTo(container);
				return editor;
			},
			getValue : function(target) {
				return $(target).val();
			},
			setValue : function(target, value) {
				$(target).val(value);
			},
			resize : function(target, width) {
				var editor = $(target);
				if ($.boxModel == true) {
					editor.width(width - (editor.outerWidth() - editor.width()));
				} else {
					editor.width(width);
				}
			}
		},
		textarea : {
			init : function(container, options) {
				var editor = $('<textarea class="datagrid-editable-input"></textarea>')
						.appendTo(container);
				return editor;
			},
			getValue : function(target) {
				return $(target).val();
			},
			setValue : function(target, value) {
				$(target).val(value);
			},
			resize : function(target, width) {
				var editor = $(target);
				if ($.boxModel == true) {
					editor.width(width - (editor.outerWidth() - editor.width()));
				} else {
					editor.width(width);
				}
			}
		},
		checkbox : {
			init : function(container, options) {
				var editor = $('<input type="checkbox">').appendTo(container);
				editor.val(options.on);
				editor.attr('offval', options.off);
				return editor;
			},
			getValue : function(target) {
				if ($(target).attr('checked')) {
					return $(target).val();
				} else {
					return $(target).attr('offval');
				}
			},
			setValue : function(target, value) {
				var checked=false;
				if($(target).val()==value){
					checked=true;
				}
				$.fn.prop?$(target).prop('checked',checked):$(target).attr('checked',checked);
			}
		},
		numberbox : {
			init : function(container, options) {
				var editor = $('<input type="text" class="datagrid-editable-input">')
						.appendTo(container);
				editor.numberbox(options);
				return editor;
			},
			destroy : function(target) {
				$(target).numberbox('destroy');
			},
			getValue : function(target) {
				return $(target).val();
			},
			setValue : function(target, value) {
				$(target).val(value);
			},
			resize : function(target, width) {
				var editor = $(target);
				if ($.boxModel == true) {
					editor.width(width - (editor.outerWidth() - editor.width()));
				} else {
					editor.width(width);
				}
			}
		},
		validatebox : {
			init : function(container, options) {
				var editor = $('<input type="text" class="datagrid-editable-input">')
						.appendTo(container);
				editor.validatebox(options);
				return editor;
			},
			destroy : function(target) {
				$(target).validatebox('destroy');
			},
			getValue : function(target) {
				return $(target).val();
			},
			setValue : function(target, value) {
				$(target).val(value);
			},
			resize : function(target, width) {
				var editor = $(target);
				if ($.boxModel == true) {
					editor.width(width - (editor.outerWidth() - editor.width()));
				} else {
					editor.width(width);
				}
			}
		},
		datebox : {
			init : function(container, options) {
				var editor = $('<input type="text">').appendTo(container);
				editor.datebox(options);
				return editor;
			},
			destroy : function(target) {
				$(target).datebox('destroy');
			},
			getValue : function(target) {
				return $(target).datebox('getValue');
			},
			setValue : function(target, value) {
				$(target).datebox('setValue', value);
			},
			resize : function(target, width) {
				$(target).datebox('resize', width);
			}
		},
		combobox : {
			init : function(container, options) {
				var editor = $('<input type="text">').appendTo(container);
				editor.combobox(options || {});
				return editor;
			},
			destroy : function(target) {
				$(target).combobox('destroy');
			},
			getValue : function(target) {
				return $(target).combobox('getValue');
			},
			setValue : function(target, value) {
				$(target).combobox('setValue', value);
			},
			resize : function(target, width) {
				$(target).combobox('resize', width);
			}
		},
		combotree : {
			init : function(container, options) {
				var editor = $('<input type="text">').appendTo(container);
				editor.combotree(options);
				return editor;
			},
			destroy : function(target) {
				$(target).combotree('destroy');
			},
			getValue : function(target) {
				return $(target).combotree('getValue');
			},
			setValue : function(target, value) {
				$(target).combotree('setValue', value);
			},
			resize : function(target, width) {
				$(target).combotree('resize', width);
			}
		}
	};
	$.fn.datagrid.methods = {
		options : function(jq) {
			var gridOpts = $.data(jq[0], 'datagrid').options;
			var panelOpts = $.data(jq[0], 'datagrid').panel.panel('options');
			var opts = $.extend(gridOpts, {
						width : panelOpts.width,
						height : panelOpts.height,
						closed : panelOpts.closed,
						collapsed : panelOpts.collapsed,
						minimized : panelOpts.minimized,
						maximized : panelOpts.maximized
					});
			var pager = jq.datagrid('getPager');
			if (pager.length) {
				var pagerOpts = pager.pagination('options');
				$.extend(opts, {
							pageNumber : pagerOpts.pageNumber,
							pageSize : pagerOpts.pageSize
						});
			}
			return opts;
		},
		getPanel : function(jq) {
			return $.data(jq[0], 'datagrid').panel;
		},
		getPager : function(jq) {
			return $.data(jq[0], 'datagrid').panel.find('div.datagrid-pager');
		},
		getColumnFields : function(jq, frozen) {
			return getColumnFields(jq[0], frozen);
		},
		getColumnOption : function(jq, field) {
			return getColumnOption(jq[0], field);
		},
		resize : function(jq, param) {
			return jq.each(function() {
						setSize(this, param);
					});
		},
		load : function(jq, param) {
			return jq.each(function() {
						var opts = $(this).datagrid('options');
						opts.pageNumber = 1;
						var pager = $(this).datagrid('getPager');
						pager.pagination({
									pageNumber : 1
								});
						request(this, param);
					});
		},
		reload : function(jq, param) {
			return jq.each(function() {
						request(this, param);
					});
		},
		reloadFooter : function(jq, footer) {
			return jq.each(function() {
						var opts = $.data(this, 'datagrid').options;
						var view = $(this).datagrid('getPanel')
								.children('div.datagrid-view');
						var gridView1 = view.children('div.datagrid-view1');
						var gridView2 = view.children('div.datagrid-view2');
						if (footer) {
							$.data(this, 'datagrid').footer = footer;
						}
						if (opts.showFooter) {
							opts.view.renderFooter.call(opts.view, this, gridView2
											.find('div.datagrid-footer-inner'),
									false);
							opts.view.renderFooter.call(opts.view, this, gridView1
											.find('div.datagrid-footer-inner'),
									true);
							if (opts.view.onAfterRender) {
								opts.view.onAfterRender.call(opts.view, this);
							}
							$(this).datagrid('fixRowHeight');
						}
					});
		},
		loading : function(jq) {
			return jq.each(function() {
						var opts = $.data(this, 'datagrid').options;
						$(this).datagrid('getPager').pagination('loading');
						if (opts.loadMsg) {
							var wrap = $(this).datagrid('getPanel');
							$('<div class="datagrid-mask"></div>').css({
										display : 'block',
										width : wrap.width(),
										height : wrap.height()
									}).appendTo(wrap);
							$('<div class="datagrid-mask-msg"></div>')
									.html(opts.loadMsg).appendTo(wrap).css({
										display : 'block',
										left : (wrap.width() - $(
												'div.datagrid-mask-msg', wrap)
												.outerWidth())
												/ 2,
										top : (wrap.height() - $(
												'div.datagrid-mask-msg', wrap)
												.outerHeight())
												/ 2
									});
						}
					});
		},
		loaded : function(jq) {
			return jq.each(function() {
						$(this).datagrid('getPager').pagination('loaded');
						var wrap = $(this).datagrid('getPanel');
						wrap.children('div.datagrid-mask-msg').remove();
						wrap.children('div.datagrid-mask').remove();
					});
		},
		fitColumns : function(jq) {
			return jq.each(function() {
						fitColumns(this);
					});
		},
		fixColumnSize : function(jq) {
			return jq.each(function() {
						fixColumnSize(this);
					});
		},
		fixRowHeight : function(jq, index) {
			return jq.each(function() {
						fixRowHeight(this, index);
					});
		},
		loadData : function(jq, data) {
			return jq.each(function() {
						renderGrid(this, data);
						resetOperation(this);
					});
		},
		getData : function(jq) {
			return $.data(jq[0], 'datagrid').data;
		},
		getRows : function(jq) {
			return $.data(jq[0], 'datagrid').data.rows;
		},
		getFooterRows : function(jq) {
			return $.data(jq[0], 'datagrid').footer;
		},
		getRowIndex : function(jq, id) {
			return getRowIndex(jq[0], id);
		},
		getSelected : function(jq) {
			var rows = getSelected(jq[0]);
			return rows.length > 0 ? rows[0] : null;
		},
		getSelections : function(jq) {
			return getSelected(jq[0]);
		},
		clearSelections : function(jq) {
			return jq.each(function() {
						clearSelections(this);
					});
		},
		selectAll : function(jq) {
			return jq.each(function() {
						selectAll(this);
					});
		},
		unselectAll : function(jq) {
			return jq.each(function() {
						unselectAll(this);
					});
		},
		selectRow : function(jq, index) {
			return jq.each(function() {
						selectRow(this, index);
					});
		},
		selectRecord : function(jq, id) {
			return jq.each(function() {
						selectRecord(this, id);
					});
		},
		unselectRow : function(jq, index) {
			return jq.each(function() {
						unselectRow(this, index);
					});
		},
		beginEdit : function(jq, index) {
			return jq.each(function() {
						beginEdit(this, index);
					});
		},
		endEdit : function(jq, index) {
			return jq.each(function() {
						stopEdit(this, index, false);
					});
		},
		cancelEdit : function(jq, index) {
			return jq.each(function() {
						stopEdit(this, index, true);
					});
		},
		getEditors : function(jq, index) {
			return getEditors(jq[0], index);
		},
		getEditor : function(jq, options) {
			return getEditor(jq[0], options);
		},
		refreshRow : function(jq, index) {
			return jq.each(function() {
						var opts = $.data(this, 'datagrid').options;
						opts.view.refreshRow.call(opts.view, this, index);
					});
		},
		validateRow : function(jq, index) {
			return validateRow(jq[0], index);
		},
		updateRow:function(jq,param){
			return jq.each(function(){
				var opts=$.data(this,'datagrid').options;
				opts.view.updateRow.call(opts.view,this,param.index,param.row);
			});
		},
		appendRow : function(jq, row) {
			return jq.each(function() {
						appendRow(this, row);
					});
		},
		insertRow : function(jq, param) {
			return jq.each(function() {
						insertRow(this, param);
					});
		},
		deleteRow : function(jq, index) {
			return jq.each(function() {
						deleteRow(this, index);
					});
		},
		getChanges : function(jq, type) {
			return getChanges(jq[0], type);
		},
		acceptChanges : function(jq) {
			return jq.each(function() {
						acceptChanges(this);
					});
		},
		rejectChanges : function(jq) {
			return jq.each(function() {
						rejectChanges(this);
					});
		},
		mergeCells : function(jq, options) {
			return jq.each(function() {
						mergeCells(this, options);
					});
		},
		showColumn : function(jq, field) {
			return jq.each(function() {
						var panel = $(this).datagrid('getPanel');
						panel.find('td[field=' + field + ']').show();
						$(this).datagrid('getColumnOption', field).hidden = false;
						$(this).datagrid('fitColumns');
					});
		},
		hideColumn : function(jq, field) {
			return jq.each(function() {
						var panel = $(this).datagrid('getPanel');
						panel.find('td[field=' + field + ']').hide();
						$(this).datagrid('getColumnOption', field).hidden = true;
						$(this).datagrid('fitColumns');
					});
		}
	};
	$.fn.datagrid.parseOptions = function(target) {
		var t = $(target);
		return $.extend({}, $.fn.panel.parseOptions(target), {
			fitColumns : (t.attr('fitColumns')
					? t.attr('fitColumns') == 'true'
					: undefined),
			striped : (t.attr('striped')
					? t.attr('striped') == 'true'
					: undefined),
			nowrap : (t.attr('nowrap') ? t.attr('nowrap') == 'true' : undefined),
			rownumbers : (t.attr('rownumbers')
					? t.attr('rownumbers') == 'true'
					: undefined),
			singleSelect : (t.attr('singleSelect')
					? t.attr('singleSelect') == 'true'
					: undefined),
			pagination : (t.attr('pagination')
					? t.attr('pagination') == 'true'
					: undefined),
			pageSize : (t.attr('pageSize')
					? parseInt(t.attr('pageSize'))
					: undefined),
			pageList : (t.attr('pageList')
					? eval(t.attr('pageList'))
					: undefined),
			remoteSort : (t.attr('remoteSort')
					? t.attr('remoteSort') == 'true'
					: undefined),
			sortName:t.attr('sortName'),
			sortOrder:t.attr('sortOrder'),
			showHeader : (t.attr('showHeader')
					? t.attr('showHeader') == 'true'
					: undefined),
			showFooter : (t.attr('showFooter')
					? t.attr('showFooter') == 'true'
					: undefined),
			scrollbarSize : (t.attr('scrollbarSize') ? parseInt(t
					.attr('scrollbarSize')) : undefined),
			loadMsg : (t.attr('loadMsg') != undefined
					? t.attr('loadMsg')
					: undefined),
			idField : t.attr('idField'),
			toolbar : t.attr('toolbar'),
			url : t.attr('url')
		});
	};
	var view = {
		render : function(target, container, frozen) {
			var opts = $.data(target, 'datagrid').options;
			var rows = $.data(target, 'datagrid').data.rows;
			var fields = $(target).datagrid('getColumnFields', frozen);
			if (frozen) {
				if (!(opts.rownumbers || (opts.frozenColumns && opts.frozenColumns.length))) {
					return;
				}
			}
			var html = ['<table cellspacing="0" cellpadding="0" border="0"><tbody>'];
			for (var i = 0; i < rows.length; i++) {
				var cls = (i % 2 && opts.striped)
						? 'class="datagrid-row-alt"'
						: '';
				var style = opts.rowStyler ? opts.rowStyler.call(target, i,
						rows[i]) : '';
				style = style ? 'style="' + style + '"' : '';
				html.push('<tr datagrid-row-index="' + i + '" ' + cls + ' '
						+ style + '>');
				html.push(this.renderRow.call(this, target, fields, frozen, i,
						rows[i]));
				html.push('</tr>');
			}
			html.push('</tbody></table>');
			$(container).html(html.join(''));
		},
		renderFooter : function(target, container, frozen) {
			var opts = $.data(target, 'datagrid').options;
			var rows = $.data(target, 'datagrid').footer || [];
			var fields = $(target).datagrid('getColumnFields', frozen);
			var html = ['<table cellspacing="0" cellpadding="0" border="0"><tbody>'];
			for (var i = 0; i < rows.length; i++) {
				html.push('<tr datagrid-row-index="' + i + '">');
				html.push(this.renderRow.call(this, target, fields, frozen, i,
						rows[i]));
				html.push('</tr>');
			}
			html.push('</tbody></table>');
			$(container).html(html.join(''));
		},
		renderRow : function(target, fields, frozen, rowIndex, rowData) {
			var opts = $.data(target, 'datagrid').options;
			var cc = [];
			if (frozen && opts.rownumbers) {
				var rowNumber = rowIndex + 1;
				if (opts.pagination) {
					rowNumber += (opts.pageNumber - 1) * opts.pageSize;
				}
				cc
						.push('<td class="datagrid-td-rownumber"><div class="datagrid-cell-rownumber">'
								+ rowNumber + '</div></td>');
			}
			for (var i = 0; i < fields.length; i++) {
				var field = fields[i];
				var col = $(target).datagrid('getColumnOption', field);
				if (col) {
					var style = col.styler
							? (col.styler(rowData[field], rowData, rowIndex) || '')
							: '';
					style = col.hidden ? 'style="display:none;' + style
							+ '"' : (style ? 'style="' + style + '"' : '');
					cc.push('<td field="' + field + '" ' + style + '>');
					style = 'width:' + (col.boxWidth) + 'px;';
					style += 'text-align:' + (col.align || 'left') + ';';
					style += opts.nowrap == false ? 'white-space:normal;' : '';
					cc.push('<div style="' + style + '" ');
					if (col.checkbox) {
						cc.push('class="datagrid-cell-check ');
					} else {
						cc.push('class="datagrid-cell ');
					}
					cc.push('">');
					if (col.checkbox) {
						cc.push('<input type="checkbox"/>');
					} else {
						if (col.formatter) {
							cc.push(col.formatter(rowData[field], rowData, rowIndex));
						} else {
							cc.push(rowData[field]);
						}
					}
					cc.push('</div>');
					cc.push('</td>');
				}
			}
			return cc.join('');
		},
		refreshRow : function(target,rowIndex){
			var row={};
			var fields = $(target).datagrid('getColumnFields',true).concat($(target).datagrid('getColumnFields',false));
			for(var i=0;i<fields.length;i++){
				row[fields[i]]=undefined;
			}
			var rows=$(target).datagrid('getRows');
			$.extend(row,rows[rowIndex]);
			this.updateRow.call(this,target,rowIndex,row);
		},
		updateRow:function(target,rowIndex,row){
			var opts=$.data(target,'datagrid').options;
			var panel=$(target).datagrid('getPanel');
			var rows=$(target).datagrid('getRows');
			var tr=panel.find('div.datagrid-body tr[datagrid-row-index="'+rowIndex+'"]');
			for(var field in row){
				rows[rowIndex][field]=row[field];
				var td=tr.children('td[field="'+field+'"]');
				var cell=td.find('div.datagrid-cell');
				var col=$(target).datagrid('getColumnOption',field);
				if(col){
					var style=col.styler?col.styler(rows[rowIndex][field],rows[rowIndex],rowIndex):'';
					td.attr('style',style||'');
					if (col.hidden) {
						td.hide();
					}
					if (col.formatter) {
						cell.html(col.formatter(rows[rowIndex][field],
								rows[rowIndex], rowIndex));
					} else {
						cell.html(rows[rowIndex][field]);
					}
				}
			}
			var style = opts.rowStyler ? opts.rowStyler.call(target, rowIndex,
					rows[rowIndex]) : '';
			tr.attr('style', style || '');
			$(target).datagrid('fixRowHeight', rowIndex);
		},
		insertRow : function(target, rowIndex, row) {
			var opts = $.data(target, 'datagrid').options;
			var data = $.data(target, 'datagrid').data;
			var view = $(target).datagrid('getPanel')
					.children('div.datagrid-view');
			var gridView1 = view.children('div.datagrid-view1');
			var gridView2 = view.children('div.datagrid-view2');
			if (rowIndex == undefined || rowIndex == null) {
				rowIndex = data.rows.length;
			}
			if (rowIndex > data.rows.length) {
				rowIndex = data.rows.length;
			}
			for (var i = data.rows.length - 1; i >= rowIndex; i--) {
				gridView2.children('div.datagrid-body')
						.find('tr[datagrid-row-index=' + i + ']').attr(
								'datagrid-row-index', i + 1);
				var tr = gridView1.children('div.datagrid-body')
						.find('tr[datagrid-row-index=' + i + ']').attr(
								'datagrid-row-index', i + 1);
				if (opts.rownumbers) {
					tr.find('div.datagrid-cell-rownumber').html(i + 2);
				}
			}
			var frozenFields = $(target).datagrid('getColumnFields', true);
			var fields = $(target).datagrid('getColumnFields', false);
			var tr1 = '<tr datagrid-row-index="' + rowIndex + '">'
					+ this.renderRow.call(this, target, frozenFields, true, rowIndex, row)
					+ '</tr>';
			var tr2 = '<tr datagrid-row-index="' + rowIndex + '">'
					+ this.renderRow.call(this, target, fields, false, rowIndex, row)
					+ '</tr>';
			if (rowIndex >= data.rows.length) {
				var gridBody1 = gridView1.children('div.datagrid-body')
						.children('div.datagrid-body-inner');
				var gridBody2 = gridView2.children('div.datagrid-body');
				if (data.rows.length) {
					gridBody1.find('tr:last[datagrid-row-index]').after(tr1);
					gridBody2.find('tr:last[datagrid-row-index]').after(tr2);
				} else {
					gridBody1
							.html('<table cellspacing="0" cellpadding="0" border="0"><tbody>'
									+ tr1 + '</tbody></table>');
					gridBody2
							.html('<table cellspacing="0" cellpadding="0" border="0"><tbody>'
									+ tr2 + '</tbody></table>');
				}
			} else {
				gridView1.children('div.datagrid-body')
						.find('tr[datagrid-row-index=' + (rowIndex + 1) + ']')
						.before(tr1);
				gridView2.children('div.datagrid-body')
						.find('tr[datagrid-row-index=' + (rowIndex + 1) + ']')
						.before(tr2);
			}
			data.total += 1;
			data.rows.splice(rowIndex, 0, row);
			this.refreshRow.call(this, target, rowIndex);
		},
		deleteRow : function(target, rowIndex) {
			var opts = $.data(target, 'datagrid').options;
			var data = $.data(target, 'datagrid').data;
			var view = $(target).datagrid('getPanel')
					.children('div.datagrid-view');
			var gridView1 = view.children('div.datagrid-view1');
			var gridView2 = view.children('div.datagrid-view2');
			gridView1.children('div.datagrid-body').find('tr[datagrid-row-index='
					+ rowIndex + ']').remove();
			gridView2.children('div.datagrid-body').find('tr[datagrid-row-index='
					+ rowIndex + ']').remove();
			for (var i = rowIndex + 1; i < data.rows.length; i++) {
				gridView2.children('div.datagrid-body')
						.find('tr[datagrid-row-index=' + i + ']').attr(
								'datagrid-row-index', i - 1);
				var tr = gridView1.children('div.datagrid-body')
						.find('tr[datagrid-row-index=' + i + ']').attr(
								'datagrid-row-index', i - 1);
				if (opts.rownumbers) {
					tr.find('div.datagrid-cell-rownumber').html(i);
				}
			}
			data.total -= 1;
			data.rows.splice(rowIndex, 1);
		},
		onBeforeRender : function(target, rows) {
		},
		onAfterRender : function(target) {
			var opts = $.data(target, 'datagrid').options;
			if (opts.showFooter) {
				var footer = $(target).datagrid('getPanel')
						.find('div.datagrid-footer');
				footer
						.find('div.datagrid-cell-rownumber,div.datagrid-cell-check')
						.css('visibility', 'hidden');
			}
		}
	};
	$.fn.datagrid.defaults = $.extend({}, $.fn.panel.defaults, {
				frozenColumns : null,
				columns : null,
				fitColumns : false,
				toolbar : null,
				striped : false,
				method : 'post',
				nowrap : true,
				idField : null,
				url : null,
				loadMsg : 'Processing, please wait ...',
				rownumbers : false,
				singleSelect : false,
				pagination : false,
				pageNumber : 1,
				pageSize : 10,
				pageList : [10, 20, 30, 40, 50],
				queryParams : {},
				sortName : null,
				sortOrder : 'asc',
				remoteSort : true,
				showHeader : true,
				showFooter : false,
				scrollbarSize : 18,
				rowStyler : function(rowIndex, rowData) {
				},
				loadFilter : function(data) {
					if (typeof data.length == 'number'
							&& typeof data.splice == 'function') {
						return {
							total : data.length,
							rows : data
						};
					} else {
						return data;
					}
				},
				editors : editors,
				editConfig : {
					getTr : function(target, rowIndex) {
						return $(target)
								.datagrid('getPanel')
								.find('div.datagrid-body tr[datagrid-row-index='
										+ rowIndex + ']');
					},
					getRow : function(target, rowIndex) {
						return $.data(target, 'datagrid').data.rows[rowIndex];
					}
				},
				view : view,
				onBeforeLoad : function(param) {
				},
				onLoadSuccess : function(data) {
				},
				onLoadError : function() {
				},
				onClickRow : function(rowIndex, rowData) {
				},
				onDblClickRow : function(rowIndex, rowData) {
				},
				onClickCell : function(rowIndex, field, value) {
				},
				onDblClickCell : function(rowIndex, field, value) {
				},
				onSortColumn : function(sort, order) {
				},
				onResizeColumn : function(field, width) {
				},
				onSelect : function(rowIndex, rowData) {
				},
				onUnselect : function(rowIndex, rowData) {
				},
				onSelectAll : function(rows) {
				},
				onUnselectAll : function(rows) {
				},
				onBeforeEdit : function(rowIndex, rowData) {
				},
				onAfterEdit : function(rowIndex, rowData, changes) {
				},
				onCancelEdit : function(rowIndex, rowData) {
				},
				onHeaderContextMenu : function(e, field) {
				},
				onRowContextMenu : function(e, rowIndex, rowData) {
				}
			});
})(jQuery);
  
/***/