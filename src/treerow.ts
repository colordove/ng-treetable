import {Component, Input, OnInit, Inject, forwardRef, SimpleChanges} from "@angular/core";
import {TreeNode} from "./model";
import {TreeTable} from "./treetable";

@Component({
    selector: '[pTreeRow]',
    templateUrl: './treerow.html',
})
export class UITreeRow implements OnInit {

    @Input() node: TreeNode;

    @Input() parentNode: TreeNode;

    @Input() level: number = 0;

    @Input() labelExpand: string = "Expand";

    @Input() labelCollapse: string = "Collapse";

    @Input() leftHeader = true;

    constructor(
      @Inject(forwardRef(() => TreeTable)) public treeTable:TreeTable
    ) {}

    ngOnInit() {
        this.node.parent = this.parentNode;
    }
    ngOnChanges(changes: SimpleChanges) {
        if (changes['node'] && this.node){
        }
    }
    toggle(event: Event) {
        let expanded = true;
        function isAllExpanded(nodes: any) {
          nodes.map(node => {
            if (node.children && !node.expanded) {
                expanded = false;
            }
            if (node.children) {
                isAllExpanded(node.children);
            }
          });
          return expanded;
        }
        if(this.node.expanded)
            this.treeTable.onNodeCollapse.emit({originalEvent: event, node: this.node});
        else
            this.treeTable.onNodeExpand.emit({originalEvent: event, node: this.node});

        this.node.expanded = !this.node.expanded;

        if (!this.treeTable.value[0].expanded) {
            this.treeTable.nodeToggle('展开');
        } else if (isAllExpanded(this.treeTable.value)) {
            this.treeTable.nodeToggle('折叠');
        }

        event.preventDefault();
    }

    isLeaf() {
        return this.node.leaf == false ? false : !(this.node.children&&this.node.children.length);
    }

    isSelected() {
        return this.treeTable.isSelected(this.node);
    }

    onRowClick(event: MouseEvent, col) {
        this.treeTable.onRowClick(event, this.node, col);
    }

    tdClicked(node, col) {
      // console.log(data, filed);
        const tdValue = this.resolveFieldData(node.data, col.field);
        this.treeTable.onTdClick.emit({
            node: node,
            col: col,
            filed: col.field,
            value: tdValue
        });
    }

    onRowRightClick(event: MouseEvent) {
        this.treeTable.onRowRightClick(event, this.node);
    }

    onRowTouchEnd() {
        this.treeTable.onRowTouchEnd();
    }

    resolveFieldData(data: any, field: string): any {
        if(data && field) {
            if(field.indexOf('.') == -1) {
                return data[field];
            }
            else {
                let fields: string[] = field.split('.');
                let value = data;
                for(var i = 0, len = fields.length; i < len; ++i) {
                    value = value[fields[i]];
                }
                return value;
            }
        }
        else {
            return null;
        }
    }
}
