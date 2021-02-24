import { Component, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as L from 'leaflet';
import * as Coordinates from 'coordinate-parser';
import { environment } from '../../environments/environment'


type User = {
  id: number,
  name: string
};

type Site = {
  id: number,
  name: string,
  details: string,
  latitude: number,
  longitude: number
}

@Component({
  selector: 'app-image-submission-form',
  templateUrl: './image-submission-form.component.html',
  styleUrls: ['./image-submission-form.component.css']
})

export class ImageSubmissionFormComponent implements OnInit {

  public imageSubmissionForm: FormGroup;

  magnesiemap: L.Map | null = null;

  marker: L.Marker | null = null;

  icon = {
    icon: L.icon({
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      iconUrl: 'data:image/svg+xml;base64,' + btoa('<?xml version="1.0" ?><svg height="24" version="1.1" width="24" xmlns="http://www.w3.org/2000/svg" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><g transform="translate(0 -1028.4)"><path d="m12 0c-4.4183 2.3685e-15 -8 3.5817-8 8 0 1.421 0.3816 2.75 1.0312 3.906 0.1079 0.192 0.221 0.381 0.3438 0.563l6.625 11.531 6.625-11.531c0.102-0.151 0.19-0.311 0.281-0.469l0.063-0.094c0.649-1.156 1.031-2.485 1.031-3.906 0-4.4183-3.582-8-8-8zm0 4c2.209 0 4 1.7909 4 4 0 2.209-1.791 4-4 4-2.2091 0-4-1.791-4-4 0-2.2091 1.7909-4 4-4z" fill="#e74c3c" transform="translate(0 1028.4)"/><path d="m12 3c-2.7614 0-5 2.2386-5 5 0 2.761 2.2386 5 5 5 2.761 0 5-2.239 5-5 0-2.7614-2.239-5-5-5zm0 2c1.657 0 3 1.3431 3 3s-1.343 3-3 3-3-1.3431-3-3 1.343-3 3-3z" fill="#c0392b" transform="translate(0 1028.4)"/></g></svg>')
    })
  };

  users_list: User[] = [];
  users_select_list: User[] = [];

  sites_list: Site[] = [];
  sites_select_list: Site[] = [];

  isMarkerEditionEnabled = true;

  posts: any;


  constructor(private http: HttpClient) {
    this.imageSubmissionForm = new FormGroup({
      user: new FormGroup({
        id: new FormControl(0),
        name: new FormControl('', [Validators.required, Validators.minLength(3)])
      }),
      site: new FormGroup({
        id: new FormControl(0),
        name: new FormControl('', [Validators.required, Validators.minLength(3)]),
        details: new FormControl(''),
        latitude: new FormControl(null, [Validators.required, Validators.min(-90.), Validators.max(90.)]),
        longitude: new FormControl(null, [Validators.required, Validators.min(-180.), Validators.max(180.)]),
      }),
      photos: new FormArray([])
    });
  }
  get user(): FormGroup {
    return this.imageSubmissionForm.get('user') as FormGroup;
  }

  get userId(): FormControl {
    return this.user.get('id') as FormControl;
  }

  get userName(): FormControl {
    return this.user.get('name') as FormControl;
  }

  get site(): FormGroup {
    return this.imageSubmissionForm.get('site') as FormGroup;
  }

  get siteId(): FormControl {
    return this.site.get('id') as FormControl;
  }

  get siteName(): FormControl {
    return this.site.get('name') as FormControl;
  }

  get siteDetails(): FormControl {
    return this.site.get('details') as FormControl;
  }

  get siteLatitude(): FormControl {
    return this.site.get('latitude') as FormControl;
  }

  get siteLongitude(): FormControl {
    return this.site.get('longitude') as FormControl;
  }

  get photos(): FormArray {
    return this.imageSubmissionForm.get('photos') as FormArray;
  }

  get photosControls(): FormGroup[] {
    return this.photos.controls as FormGroup[];
  }

  onSubmit() {

    if (this.imageSubmissionForm.invalid) {
      return;
    }
    let imageSubmissionFormData = new FormData();
    imageSubmissionFormData.append('user_id', this.userId.value);
    imageSubmissionFormData.append('user_name', this.userName.value);
    imageSubmissionFormData.append('site_id', this.siteId.value);
    imageSubmissionFormData.append('site_name', this.siteName.value);
    imageSubmissionFormData.append('site_details', this.siteDetails.value);
    imageSubmissionFormData.append('site_latitude', this.siteLatitude.value);
    imageSubmissionFormData.append('site_longitude', this.siteLongitude.value);
    let files : File[] = this.photos.controls.map(e => e.value.file);
    files.forEach(file => imageSubmissionFormData.append('photos', file));

    // Initialize Params Object
    let Params = new HttpParams();
    // Begin assigning parameters
    // headers: { 'Content-Type': 'multipart/form-data' },
    return this.http.post(environment.backend_service_url + '/submit', imageSubmissionFormData, { responseType: 'text' }).subscribe(data => {
      this.posts = data;
      // show data in console
      console.log(this.posts);
    });

  }

  markerFromLatLong() {
    try {
      let position = new Coordinates(this.siteLatitude.value + ", " + this.siteLongitude.value);
      this.updateMap(position.getLatitude(), position.getLongitude());
    } catch (error) {
      console.error("Invalid coodinates")
    }
  }

  updateMap(lat: number, long: number) {
    if (null != this.magnesiemap) {
      if (this.marker != null)
        this.magnesiemap.removeLayer(this.marker);
      this.marker = L.marker([lat, long], this.icon);
      this.magnesiemap.addLayer(this.marker);

      this.magnesiemap.setView([lat, long], this.magnesiemap.getZoom());
    }
  }

  placeMarker(e: L.LeafletMouseEvent) {
    if (this.isMarkerEditionEnabled) {
      this.siteLatitude.setValue(e.latlng.lat);
      this.siteLongitude.setValue(e.latlng.lng);
      this.updateMap(e.latlng.lat, e.latlng.lng);
    }
  }

  fillUserFormField() {
    let selectedId = this.userId.value;
    if (selectedId == 0) {
      this.userName.setValue("");
      this.userName.enable();
    } else {
      let name = "";
      this.users_list.forEach(user => {
        if (user.id == selectedId) {
          name = user.name;
        }
      });
      this.userName.setValue(name);
      this.userName.disable();
    }
  }

  fillSiteFormField() {
    let selectedId = this.siteId.value;
    if (selectedId == 0) {
      this.siteName.setValue("");
      this.siteName.enable();
      this.siteDetails.setValue("");
      this.siteDetails.enable();
      this.siteLatitude.setValue("");
      this.siteLatitude.enable();
      this.siteLongitude.setValue("");
      this.siteLongitude.enable();
      this.isMarkerEditionEnabled = true;
      if (null != this.magnesiemap) {
        this.magnesiemap.setView([46.5, 2.6], 5);
        if (this.marker != null)
          this.magnesiemap.removeLayer(this.marker);
      }
    } else {
      let name = "";
      let details = "";
      let latitude = 0.;
      let longitude = 0.;
      this.sites_list.forEach(site => {
        if (site.id == selectedId) {
          name = site.name;
          details = site.details;
          latitude = site.latitude;
          longitude = site.longitude;
        }
      });
      this.siteName.setValue(name);
      this.siteName.disable();
      this.siteDetails.setValue(details);
      this.siteDetails.disable();
      this.siteLatitude.setValue(latitude);
      this.siteLatitude.disable();
      this.siteLongitude.setValue(longitude);
      this.siteLongitude.disable();
      this.markerFromLatLong();
      this.isMarkerEditionEnabled = false;
    }
  }

  onFileChange(event: any) {

    if (event.target.files) {
      const files = event.target.files;
      console.log(files);

      for (let file of files) {
        let reader = new FileReader();
        reader.onload = (e: any) => {
          this.photos.push(new FormGroup({
            base64: new FormControl(e.target.result),
            file: new FormControl(file)
          }));
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removePhoto(i: number) {
    this.photos.removeAt(i);
  }

  ngOnInit() {
    // Déclaration de la carte avec les coordonnées du centre et le niveau de zoom.
    this.magnesiemap = L.map('magnesiemap').setView([46.5, 2.6], 5);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: 'Magnes.ie Map'
    }).addTo(this.magnesiemap);

    this.magnesiemap.on("click", this.placeMarker.bind(this));

    console.log(environment.backend_service_url);

    this.http.get(environment.backend_service_url + "/users", { responseType: 'text' }).subscribe(data => {
      this.users_list = JSON.parse(data.toString());
      let userSelectPlaceHolder: User = { id: 0, name: "Créer un nouvel utilisateur" };
      this.users_select_list = [userSelectPlaceHolder].concat(this.users_list);
    });

    this.http.get(environment.backend_service_url + "/sites", { responseType: 'text' }).subscribe(data => {
      this.sites_list = JSON.parse(data.toString());
      let siteSelectPlaceHolder: Site = { id: 0, name: "Créer un nouveau site", details: "", latitude: 0, longitude: 0 };
      this.sites_select_list = [siteSelectPlaceHolder].concat(this.sites_list);
    });
  }
}
