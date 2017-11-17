import { Pipe, PipeTransform } from '@angular/core';
/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 |  exponentialStrength:10}}
 *   formats to: 1024
 *  将number转换为千分位的字符串
 */
@Pipe({name: 'toNumber'})
export class ToNumberPipe implements PipeTransform {
    //实现了PipeTransform类，实现transform方法，当html使用了toNumber的管道，会自动调用此方法
    transform(input:number): string {
    //这里可以带多个参数，第一个参数默认是原始数据，这里是指
    //amount、total 、debt 、overdue ，见下html代码
        return input.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");//转为千分位的正则表达式
    }
}
