/**
 * Created by andrew.yang on 3/28/2017.
 */
import { Component } from '@angular/core';

@Component({
    selector: 'app-basic',
    templateUrl: 'basic.component.html',
})
export class BasicTreeComponent {
    nodes = {
        "data":
            [
                {
                    "data":{
                        "id": '1',
                        "name":"Documents",
                        "size":"78000",
                        "type":"Folder",
                    },
                    "expanded": true,
                    "children":[
                        {
                            "data":{
                                "name":"Work",
                                "size":'121212',
                                "type":"Folder"
                            },
                            "children":[
                                {
                                    "data":{
                                        "name":"Expenses.doc",
                                        "size":"30kb",
                                        "type":"Document"
                                    }
                                },
                                {
                                    "data":{
                                        "name":"Resume.doc",
                                        "size":"25kb",
                                        "type":"Resume"
                                    }
                                }
                            ]
                        },
                        {
                            "data":{
                                "name":"Home",
                                "size":"20kb",
                                "type":"Folder"
                            },
                            "children":[
                                {
                                    "data":{
                                        "name":"Invoices",
                                        "size":"20kb",
                                        "type":"Text"
                                    }
                                }
                            ]
                        }
                    ]
                },
                {
                    "data":{
                        "name":"Pictures",
                        "size":"150kb",
                        "type":"Folder"
                    },
                    "children":[
                        {
                            "data":{
                                "name":"100",
                                "size":"100",
                                "type":"100"
                            }
                        },
                        {
                            "data":{
                                "name":"primeui.png",
                                "size":"30kb",
                                "type":"Picture"
                            }
                        },
                        {
                            "data":{
                                "name":"optimus.jpg",
                                "size":"30kb",
                                "type":"Picture"
                            }
                        }
                    ]
                }
            ]
    };
    getRowStyleClass = (data) => '';

    onTdClick(data) {
      console.log(data);
    }
}
