/**
 * Created by andrew.yang on 3/28/2017.
 */
import {
  Component
} from '@angular/core';

@Component({
  selector: 'app-basic',
  templateUrl: 'basic.component.html',
  styles: [`
    .treetable {
      overflow-y: auto;
    }
    ::ng-deep .tree-table-body {
      height: 300px;
      overflow-y: scroll;
    }
  `]
})
export class BasicTreeComponent {
  nodes = {
    "data": [{
        "data": {
          "id": '1',
          "name": "Documents",
          "size": "78000",
          "type": "Folder",
        },
        "expanded": true,
        "children": [{
            "data": {
              "name": "Work",
              "size": '121212',
              "type": "Folder"
            },
            "children": [{
                "data": {
                  "name": "Expenses.doc",
                  "size": "30kb",
                  "type": "Document"
                }
              },
              {
                "data": {
                  "name": "Resume.doc",
                  "size": "25kb",
                  "type": "Resume"
                }
              }
            ]
          },
          {
            "data": {
              "name": "Home",
              "size": "20kb",
              "type": "Folder"
            },
            "children": [{
              "data": {
                "name": "Invoices",
                "size": "20kb",
                "type": "Text"
              }
            }]
          },
          {
            "data": {
              "name": "Work",
              "size": '121212',
              "type": "Folder"
            },
            "children": [{
                "data": {
                  "name": "Expenses.doc",
                  "size": "30kb",
                  "type": "Document"
                }
              },
              {
                "data": {
                  "name": "Resume.doc",
                  "size": "25kb",
                  "type": "Resume"
                }
              }
            ]
          },
          {
            "data": {
              "name": "Home",
              "size": "20kb",
              "type": "Folder"
            },
            "children": [{
              "data": {
                "name": "Invoices",
                "size": "20kb",
                "type": "Text"
              }
            }]
          },
          {
            "data": {
              "name": "Work",
              "size": '121212',
              "type": "Folder"
            },
            "children": [{
                "data": {
                  "name": "Expenses.doc",
                  "size": "30kb",
                  "type": "Document"
                }
              },
              {
                "data": {
                  "name": "Resume.doc",
                  "size": "25kb",
                  "type": "Resume"
                }
              }
            ]
          },
          {
            "data": {
              "name": "Home",
              "size": "20kb",
              "type": "Folder"
            },
            "children": [{
              "data": {
                "name": "Invoices",
                "size": "20kb",
                "type": "Text"
              }
            }]
          },
          {
            "data": {
              "name": "Home",
              "size": "20kb",
              "type": "Folder"
            },
            "children": [{
              "data": {
                "name": "Invoices",
                "size": "20kb",
                "type": "Text"
              }
            }]
          },{
            "data": {
              "name": "Home",
              "size": "20kb",
              "type": "Folder"
            },
            "children": [{
              "data": {
                "name": "Invoices",
                "size": "20kb",
                "type": "Text"
              }
            }]
          },
        ]
      }
    ]
  };
  getRowStyleClass = (data) => '';

  onTdClick(data) {
    console.log(data);
  }
}
