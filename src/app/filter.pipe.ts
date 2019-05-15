import { Pipe, PipeTransform } from '@angular/core';
import {FormsModule} from '@angular/forms'

@Pipe({
  name: 'filter',
  pure: false
})
export class FilterPipe implements PipeTransform {

  transform(items: any[], term): any {
  
    return term 
        ? items.filter(item => {
          try {
            return item.titulo.indexOf(term) !== -1
          }catch($error) {
            return false
          }
        })
        : items;
}

}
