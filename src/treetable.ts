import {
    NgModule, Component, Input, Output, EventEmitter, ContentChild, ContentChildren,
    QueryList, Renderer, SimpleChanges
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Header, Footer, Column, TreeSharedModule} from './shared';
import {TreeNode} from "./model";
import {UITreeRow} from "./treerow";
import {PaginatorModule} from "./paginator";
import {ToNumberPipe} from './number.pipe';

@Component({
  selector: "ay-treeTable",
  templateUrl: "./treetable.html",
  styles: [
    `.treetable-wrapper {
      display: flex;
      justify-content: flex-start;
    }
    #tree-table-body-left {
      overflow-x: hidden;
    }
    #tree-table-header-right {
      overflow-x: hidden;
    }
    .toggle {
      margin-left: 4px;
    }`
  ]
})
export class TreeTable {
  @Input() paginator: boolean;

  @Input() rows: number;

  @Input() totalRecords: number;

  @Input() pageLinks: number = 5;

  @Input() rowsPerPageOptions: number[];

  @Input() first: number = 0;

  @Input() lazy: boolean;

  @Input() virtualScroll: boolean;

  @Input() value: TreeNode[];

  @Input() selectionMode: string;

  @Input() selection: any;

  @Input() style: any;

  @Input() styleClass: string;

  @Input() labelExpand: string = "Expand";

  @Input() labelCollapse: string = "Collapse";

  @Input() metaKeySelection: boolean = true;

  @Input() contextMenu: any;

  @Input() globalFilter: any;

  @Input() filterDelay: number = 300;

  @Input() immutable: boolean;

  @Input() rowStyleClass: Function;

  @Input() hasToggle = false;

  @Input() expanded = false;

  @Output() selectionChange: EventEmitter<any> = new EventEmitter();

  @Output() onNodeSelect: EventEmitter<any> = new EventEmitter();

  @Output() onNodeUnselect: EventEmitter<any> = new EventEmitter();

  @Output() onNodeExpand: EventEmitter<any> = new EventEmitter();

  @Output() onNodeCollapse: EventEmitter<any> = new EventEmitter();

  @Output() onContextMenuSelect: EventEmitter<any> = new EventEmitter();

  @Output() onLazyLoad: EventEmitter<any> = new EventEmitter();

  @Output() onTdClick: EventEmitter<any> = new EventEmitter();

  @Output() toggleAll: EventEmitter<any> = new EventEmitter();

  @ContentChild(Header) header: Header;

  @ContentChild(Footer) footer: Footer;

  @ContentChildren(Column) columns: QueryList<Column>;

  public rowTouched: boolean;
  public loading: boolean;
  public stopFilterPropagation: boolean;
  public dataToRender: any[];
  public tLeftDataToRender: any[];
  public filterTimeout: any;
  public filteredValue: any[];
  globalFilterFunction: any;

  toggleText: string;

  constructor(public renderer: Renderer) {}
  scrollRight() {
      const top = document.getElementById("tree-table-body-right").scrollTop;
      // var b = document.getElementById("t_r_content").scrollLeft;
      document.getElementById("tree-table-body-left").scrollTop = top;
      // document.getElementById("t_r_t").scrollLeft = b;
  }
  onRowClick(event: MouseEvent, node: TreeNode, col: any) {
    let eventTarget = <Element>event.target;
    if (
      eventTarget.className &&
      eventTarget.className.indexOf("ui-treetable-toggler") === 0
    ) {
      return;
    } else if (this.selectionMode) {
      if (node.selectable === false) {
        return;
      }

      let metaSelection = this.rowTouched ? false : this.metaKeySelection;
      let index = this.findIndexInSelection(node);
      let selected = index >= 0;

      if (this.isCheckboxSelectionMode()) {
        if (selected) {
          this.propagateSelectionDown(node, false);
          if (node.parent) {
            this.propagateSelectionUp(node.parent, false);
          }
          this.selectionChange.emit(this.selection);
          this.onNodeUnselect.emit({ originalEvent: event, node: node });
        } else {
          this.propagateSelectionDown(node, true);
          if (node.parent) {
            this.propagateSelectionUp(node.parent, true);
          }
          this.selectionChange.emit(this.selection);
          this.onNodeSelect.emit({ originalEvent: event, node: node });
        }
      } else {
        if (metaSelection) {
          let metaKey = event.metaKey || event.ctrlKey;

          if (selected && metaKey) {
            if (this.isSingleSelectionMode()) {
              this.selectionChange.emit(null);
            } else {
              this.selection.splice(index, 1);
              this.selectionChange.emit(this.selection);
            }

            this.onNodeUnselect.emit({ originalEvent: event, node: node });
          } else {
            if (this.isSingleSelectionMode()) {
              this.selectionChange.emit(node);
            } else if (this.isMultipleSelectionMode()) {
              this.selection = !metaKey ? [] : this.selection || [];
              this.selection.push(node);
              this.selectionChange.emit(this.selection);
            }

            this.onNodeSelect.emit({ originalEvent: event, node: node });
          }
        } else {
          if (this.isSingleSelectionMode()) {
            if (selected) {
              this.selection = null;
              this.onNodeUnselect.emit({ originalEvent: event, node: node });
            } else {
              this.selection = node;
              this.onNodeSelect.emit({ originalEvent: event, node: node });
            }
          } else {
            if (selected) {
              this.selection.splice(index, 1);
              this.onNodeUnselect.emit({ originalEvent: event, node: node });
            } else {
              this.selection = this.selection || [];
              this.selection.push(node);
              this.onNodeSelect.emit({ originalEvent: event, node: node });
            }
          }

          this.selectionChange.emit(this.selection);
        }
      }
    }

    this.rowTouched = false;
  }
  nodeToggle(status: string) {
      if (status === '展开') {
        this.expanded = true;
        this.toggle();
      } else {
        this.expanded = false;
        this.toggle();
      }
  }

  // 打开/折叠
  addExpaned(nodes: any, collpase: boolean) {
    nodes.map(node => {
      node.expanded = collpase;
      if (node.children) {
        this.addExpaned(node.children, collpase);
      }
    });
  }

  toggle() {
    if (!this.expanded) {
      this.toggleText = "折叠";
      this.addExpaned(this.value, true);
      this.expanded = true;
    } else {
      this.toggleText = "展开";
      this.addExpaned(this.value, false);
      this.expanded = false;
    }
    this.toggleAll.emit();
  }

  onRowTouchEnd() {
    this.rowTouched = true;
  }

  onRowRightClick(event: MouseEvent, node: TreeNode) {
    if (this.contextMenu) {
      let index = this.findIndexInSelection(node);
      let selected = index >= 0;

      if (!selected) {
        if (this.isSingleSelectionMode()) {
          this.selection = node;
        } else if (this.isMultipleSelectionMode()) {
          this.selection = [];
          this.selection.push(node);
          this.selectionChange.emit(this.selection);
        }

        this.selectionChange.emit(this.selection);
      }

      this.contextMenu.show(event);
      this.onContextMenuSelect.emit({ originalEvent: event, node: node });
    }
  }

  findIndexInSelection(node: TreeNode) {
    let index: number = -1;

    if (this.selectionMode && this.selection) {
      if (this.isSingleSelectionMode()) {
        index = this.selection == node ? 0 : -1;
      } else {
        for (let i = 0; i < this.selection.length; i++) {
          if (this.selection[i] == node) {
            index = i;
            break;
          }
        }
      }
    }

    return index;
  }

  propagateSelectionUp(node: TreeNode, select: boolean) {
    if (node.children && node.children.length) {
      let selectedCount: number = 0;
      let childPartialSelected: boolean = false;
      for (let child of node.children) {
        if (this.isSelected(child)) {
          selectedCount++;
        } else if (child.partialSelected) {
          childPartialSelected = true;
        }
      }

      if (select && selectedCount == node.children.length) {
        this.selection = this.selection || [];
        this.selection.push(node);
        node.partialSelected = false;
      } else {
        if (!select) {
          let index = this.findIndexInSelection(node);
          if (index >= 0) {
            this.selection.splice(index, 1);
          }
        }

        if (
          childPartialSelected ||
          (selectedCount > 0 && selectedCount != node.children.length)
        )
          node.partialSelected = true;
        else node.partialSelected = false;
      }
    }

    let parent = node.parent;
    if (parent) {
      this.propagateSelectionUp(parent, select);
    }
  }

  propagateSelectionDown(node: TreeNode, select: boolean) {
    let index = this.findIndexInSelection(node);

    if (select && index == -1) {
      this.selection = this.selection || [];
      this.selection.push(node);
    } else if (!select && index > -1) {
      this.selection.splice(index, 1);
    }

    node.partialSelected = false;

    if (node.children && node.children.length) {
      for (let child of node.children) {
        this.propagateSelectionDown(child, select);
      }
    }
  }

  isSelected(node: TreeNode) {
    return this.findIndexInSelection(node) != -1;
  }

  isSingleSelectionMode() {
    return this.selectionMode && this.selectionMode == "single";
  }

  isMultipleSelectionMode() {
    return this.selectionMode && this.selectionMode == "multiple";
  }

  isCheckboxSelectionMode() {
    return this.selectionMode && this.selectionMode == "checkbox";
  }

  getRowStyleClass(rowData: any) {
    let styleClass = "";
    if (this.rowStyleClass) {
      let rowClass = this.rowStyleClass.call(this, rowData);
      if (rowClass) {
        styleClass += " " + rowClass;
      }
    }
    return styleClass;
  }

  hasFooter() {
    if (this.columns) {
      let columnsArr = this.columns.toArray();
      for (let i = 0; i < columnsArr.length; i++) {
        if (columnsArr[i].footer) {
          return true;
        }
      }
    }
    return false;
  }

  ngOnInit() {
    const This = this;
    // const rightTableHeight = document.getElementById("tree-table-body-right") + 'px';
    // document.getElementById("tree-table-body-left").setAttribute('height', rightTableHeight);
    if (this.immutable) this.handleDataChange();
    if (this.expanded) {
      this.toggleText = '折叠';
    } else {
      this.toggleText = '展开';
    }
    // 打开/折叠
    function addExpaned(nodes) {
      nodes.map(node => {
        node.expanded = This.expanded;
        if (node.children) {
          addExpaned(node.children);
        }
      });
    }
    addExpaned(this.value);
  }
  ngAfterViewInit() {
    if (this.globalFilter && this.value) {
      this.globalFilterFunction = this.renderer.listen(
        this.globalFilter,
        "keyup",
        () => {
          this.filterTimeout = setTimeout(() => {
            this.filter();
            this.filterTimeout = null;
          }, this.filterDelay);
        }
      );
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes["value"] && this.value && !this.immutable) {
      this.handleDataChange();
    }
  }
  shownColumns() {
    return this.columns.filter(col => !col.hidden);
  }
  handleDataChange() {
    if (this.paginator) {
      this.updatePaginator();
    }
    this.updateDataToRender(this.filteredValue || this.value);
  }

  updatePaginator() {
    this.totalRecords = this.lazy
      ? this.totalRecords
      : this.value ? this.value.length : 0;
    if (this.totalRecords && this.first >= this.totalRecords) {
      let numberOfPages = Math.ceil(this.totalRecords / this.rows);
      this.first = Math.max((numberOfPages - 1) * this.rows, 0);
    }
  }

  paginate(event) {
    this.first = event.first;
    this.rows = event.rows;

    if (this.lazy) {
      this.stopFilterPropagation = true;
    } else {
      this.updateDataToRender(this.filteredValue || this.value);
    }
  }

  updateDataToRender(datasource) {
    if ((this.paginator || this.virtualScroll) && datasource) {
      this.dataToRender = [];
      this.tLeftDataToRender = [];
      let startIndex: number = this.lazy ? 0 : this.first;
      let endIndex: number = this.virtualScroll
        ? this.first + this.rows * 2
        : startIndex + this.rows;

      for (let i = startIndex; i < endIndex; i++) {
        if (i >= datasource.length) {
          break;
        }

        this.dataToRender.push(datasource[i]);
      }
    } else {
      this.dataToRender = datasource;
    }
    console.log(this.dataToRender);

    this.loading = false;
  }
  filterFields(object) {
    let res = false;
    this.columns.toArray().map(col => {
      if (!res && object[col.field]) {
        res = object[col.field]
          .toString()
          .toLowerCase()
          .includes(this.globalFilter.value.toString().toLowerCase());
      }
    });
    return res;
  }
  filterChildren(children, parent) {
    let res = false;
    if (children) {
      children.map(child => {
        let _fields = this.filterFields(child.data);
        let _children = this.filterChildren(child.children, child);
        res = _fields || _children || res;
      });
      parent.expanded = res;
    }
    return res;
  }
  isFiltered(node) {
    if (this.globalFilter) {
      return (
        this.filterFields(node.data) || this.filterChildren(node.children, node)
      );
    } else {
      return true;
    }
  }
  filter() {
    this.first = 0;

    this.filteredValue = this.value.filter(val => {
      return (
        this.filterFields(val.data) || this.filterChildren(val.children, val)
      );
    });

    if (this.paginator) {
      this.totalRecords = this.filteredValue
        ? this.filteredValue.length
        : this.value ? this.value.length : 0;
    }

    this.updateDataToRender(this.filteredValue || this.value);
  }
  filterConstraints = {
    startsWith(value, filter): boolean {
      if (filter === undefined || filter === null || filter.trim() === "") {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }

      let filterValue = filter.toString().toLowerCase();
      return (
        value
          .toString()
          .toLowerCase()
          .slice(0, filterValue.length) === filterValue
      );
    },

    contains(value, filter): boolean {
      if (
        filter === undefined ||
        filter === null ||
        (typeof filter === "string" && filter.trim() === "")
      ) {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }

      return (
        value
          .toString()
          .toLowerCase()
          .indexOf(filter.toLowerCase()) !== -1
      );
    },

    endsWith(value, filter): boolean {
      if (filter === undefined || filter === null || filter.trim() === "") {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }

      let filterValue = filter.toString().toLowerCase();
      return (
        value
          .toString()
          .toLowerCase()
          .indexOf(
            filterValue,
            value.toString().length - filterValue.length
          ) !== -1
      );
    },

    equals(value, filter): boolean {
      if (
        filter === undefined ||
        filter === null ||
        (typeof filter === "string" && filter.trim() === "")
      ) {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }

      return value.toString().toLowerCase() == filter.toString().toLowerCase();
    },

    in(value, filter: any[]): boolean {
      if (filter === undefined || filter === null || filter.length === 0) {
        return true;
      }

      if (value === undefined || value === null) {
        return false;
      }

      for (let i = 0; i < filter.length; i++) {
        if (filter[i] === value) return true;
      }

      return false;
    }
  };

  resolveFieldData(data: any, field: string): any {
    if (data && field) {
      if (field.indexOf(".") == -1) {
        return data[field];
      } else {
        let fields: string[] = field.split(".");
        let value = data;
        for (let i = 0, len = fields.length; i < len; ++i) {
          if (value == null) {
            return null;
          }
          value = value[fields[i]];
        }
        return value;
      }
    } else {
      return null;
    }
  }
  ngOnDestroy() {
    //remove event listener
    if (this.globalFilterFunction) {
      this.globalFilterFunction();
    }
  }
}

@NgModule({
    imports: [CommonModule,TreeSharedModule,PaginatorModule],
    exports: [TreeTable,TreeSharedModule,PaginatorModule],
    declarations: [TreeTable,UITreeRow,ToNumberPipe]
})
export class TreeTableModule { }
