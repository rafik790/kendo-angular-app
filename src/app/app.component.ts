import { Component, OnInit } from '@angular/core';
import { ProductService } from "./product.service";
import { Observable } from 'rxjs';
import { SortDescriptor, DataResult } from '@progress/kendo-data-query';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { categories, Category } from "./data.categories";
import { ChipRemoveEvent } from "@progress/kendo-angular-buttons";


import { globeIcon, SVGIcon } from "@progress/kendo-svg-icons";
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ProductService]
})
export class AppComponent implements OnInit {
  title = 'kendo-angular-app';

  public gridItems: Observable<GridDataResult> | undefined;
  public pageSize: number = 10;
  public skip: number = 0;
  public sortDescriptor: SortDescriptor[] = [];
  public filterTerm: number | null = null;
  public dropDownItems: Category[] = categories;
  public defaultItem: Category = { text: "Filter by Category", value: null };
  public globeIcon: SVGIcon = globeIcon;
  public selectedValue = 1;
  public tierListItems: Array<{ text: string, value: number }> = [{
    text: "Small", value: 1
  }, {
    text: "Medium", value: 2
  }, {
    text: "Large", value: 3
  }]
  public filterGroups: any[] = [];
  searchForm = this.fb.group({
    contentLibrary: ['SEL'],
    tier: [1],
    filters: this.fb.array([])
  });

  constructor(private service: ProductService,
    private fb: FormBuilder) {
    this.loadGridItems();
    this.filterGroups = this.getFilterData();
    this.populatFormBuilder(this.filterGroups);
  }

  private getFilterData() {
    let filterList = [];
    let data: any = {
      groupID: 1,
      groupName: "Grade",
      appliedCount: 0,
      dataList: []
    }
    data.dataList.push({ id: 1, name: "Kindergarten", children: [], visibleChild: false });
    data.dataList.push({ id: 2, name: "1st Grade", children: [], visibleChild: false });
    filterList.push(data);

    data = {
      groupID: 2,
      groupName: "Domain",
      appliedCount: 0,
      dataList: []
    }
    data.dataList.push({ id: 3, name: "Awareness of Self", children: [], visibleChild: false });
    let selfManagement: any = {
      id: 4,
      name: "Self Management",
      visibleChild: false,
      children: []
    };
    selfManagement.children.push({ id: 'Ch1', name: 'Stress Management' });
    selfManagement.children.push({ id: 'Ch2', name: 'Self Control' });
    selfManagement.children.push({ id: 'Ch3', name: 'Resilience' });
    selfManagement.children.push({ id: 'Ch10', name: 'Problem Solving' });
    data.dataList.push(selfManagement);

    let socialSkill: any = {
      id: 5,
      name: "Social Skills",
      visibleChild: false,
      children: []
    };
    socialSkill.children.push({ id: 'Ch4', name: 'Social Skills-1' });
    socialSkill.children.push({ id: 'Ch5', name: 'Social Skills-2' });
    socialSkill.children.push({ id: 'Ch6', name: 'Social Skills-3' });
    socialSkill.children.push({ id: 'Ch7', name: 'Social Skills-4' });
    data.dataList.push(socialSkill);

    filterList.push(data);

    data = {
      groupID: 3,
      groupName: "Group Size",
      appliedCount: 0,
      dataList: []
    }
    data.dataList.push({ id: 10, name: "Individual", children: [], visibleChild: false });
    data.dataList.push({ id: 11, name: "Partner", children: [], visibleChild: false });
    data.dataList.push({ id: 12, name: "Small Group", children: [], visibleChild: false });
    data.dataList.push({ id: 13, name: "Whole Group", children: [], visibleChild: false });

    filterList.push(data);
    return filterList;
  }

  ngOnInit(): void {
    this.searchForm.valueChanges.subscribe(data => {
      let formDataCopy: any = { ...this.searchForm.value };
      let filteredList = [];

      for (let filterData of formDataCopy.filters) {

        let filterArray = filterData.elemnts.filter((o: any) => o.filter === true);
        if (filterArray && filterArray.length > 0) {
          filteredList.push({
            groupID: filterData.groupID,
            groupName: filterData.groupName,
            elemnts: [...filterArray]
          });
        }

        let groupDatas = this.filterGroups.filter((o: any) => o.groupID === filterData.groupID);
        groupDatas[0].appliedCount = filterArray.length;

      }

      formDataCopy.filters = [...filteredList];
      console.log('Filtered', formDataCopy);
    });
  }

  get filterFormGroups() {
    return this.searchForm.controls["filters"] as FormArray;
  }

  public populatFormBuilder(dataList: any[]) {
    for (let grpElement of dataList) {

      const requirementForm = this.fb.group({
        groupID: grpElement.groupID,
        groupName: [grpElement.groupName],
        elemnts: this.fb.array([])
      });
      this.filterFormGroups.push(requirementForm);

      for (let groupdata of grpElement.dataList) {
        let selChild = '';
        if (groupdata.children.length > 0) {
          selChild = groupdata.children[0].id
        }

        const childForm = this.fb.group({
          filterID: [groupdata.id],
          filterName: [groupdata.name],
          filter: [false],
          subElement: [selChild]
        });

        (requirementForm.controls.elemnts as FormArray).push(childForm);
      }
    }
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


  public onRemove(e: ChipRemoveEvent, filterGroup: any): void {
    e.originalEvent.stopPropagation();
    for (let parentControl of this.filterFormGroups.controls) {
      if (parentControl instanceof FormGroup) {
        if (parentControl.controls["groupID"].getRawValue() === filterGroup.groupID) {
          let elements = (parentControl.controls["elemnts"] as FormArray)
          for (let formElement of elements.controls) {
            if (formElement instanceof FormGroup) {
              formElement.controls["filter"].setValue(false);
            }
          }
        }
      }
    }

    let groupDatas = this.filterGroups.filter((o: any) => o.groupID === filterGroup.groupID);
    groupDatas[0].appliedCount = 0;
  }
  public filterCheckBoxHandler(event:any,groupElement:any){
    if(event.target.checked){
      groupElement.visibleChild=true;
    }else{
      groupElement.visibleChild=false;
    }
  }
}
