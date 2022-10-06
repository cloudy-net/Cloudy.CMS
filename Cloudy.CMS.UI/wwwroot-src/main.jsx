import { render } from 'preact'
import { ListTable } from './list-table'
import './main.scss'
console.log("hello")
const element = document.querySelector('.list-table');
const settings = JSON.parse(element.getAttribute('settings'));

render(<ListTable {...settings} />, element);
