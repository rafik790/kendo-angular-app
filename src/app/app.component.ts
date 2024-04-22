import { Component } from '@angular/core';
import { ProductService } from "./product.service";
import { Observable } from 'rxjs';
import { SortDescriptor, DataResult } from '@progress/kendo-data-query';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { categories, Category } from "./data.categories";
import { ChipRemoveEvent } from "@progress/kendo-angular-buttons";
import {
  cancelCircleIcon,
  cancelIcon,
  trashIcon,
  xOutlineIcon,
} from "@progress/kendo-svg-icons";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ProductService]
})
export class AppComponent {
  title = 'kendo-angular-app';
  private baseImageUrl = "https://demos.telerik.com/kendo-ui/content/web/panelbar/";
  public gridItems: Observable<GridDataResult> | undefined;
  public pageSize: number = 10;
  public skip: number = 0;
  public sortDescriptor: SortDescriptor[] = [];
  public filterTerm: number | null = null;
  public dropDownItems: Category[] = categories;
  public defaultItem: Category = { text: "Filter by Category", value: null };

  constructor(private service: ProductService) {
    this.loadGridItems();
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadGridItems();
  }

  public handleSortChange(descriptor: SortDescriptor[]): void {
    this.sortDescriptor = descriptor;
    this.loadGridItems();
  }

  private loadGridItems(): void {
    this.gridItems = this.service.getProducts(
      this.skip,
      this.pageSize,
      this.sortDescriptor,
      this.filterTerm
    );
  }

  public handleFilterChange(item: Category): void {
    this.filterTerm = item.value;
    this.skip = 0;
    this.loadGridItems();
  }
  public imageUrl(imageName: string): string {
    return this.baseImageUrl + imageName + ".jpg";
  }

  public onRemove(e: ChipRemoveEvent): void {
    console.log(e);
    e.originalEvent.stopPropagation();
  }
}
