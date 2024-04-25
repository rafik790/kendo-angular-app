import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ChipRemoveEvent } from '@progress/kendo-angular-buttons';

@Component({
  selector: 'app-filter-panel',
  templateUrl: './filter-panel.component.html',
  styleUrls: ['./filter-panel.component.css']
})
export class FilterPanelComponent implements OnInit {
  @Output() refreshData = new EventEmitter<any>();
  
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

  constructor(private fb: FormBuilder) {
    
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
      this.refreshData.emit(formDataCopy);
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
          sub: this.fb.array([])
        });
        (requirementForm.controls.elemnts as FormArray).push(childForm);
      }
    }
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
