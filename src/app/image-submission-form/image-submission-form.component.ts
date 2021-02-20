import { Component, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import * as L from 'leaflet';
import * as Coordinates from 'coordinate-parser';

@Component({
  selector: 'app-image-submission-form',
  templateUrl: './image-submission-form.component.html',
  styleUrls: ['./image-submission-form.component.css']
})

export class ImageSubmissionFormComponent implements OnInit {

  imageSubmissionForm = new FormGroup({
    user: new FormGroup({
      name: new FormControl('')
    }),
    site: new FormGroup({
      name: new FormControl(''),
      details: new FormControl(''),
      longitude: new FormControl(''),
      latitude: new FormControl(''),
    })
  });

  magnesiemap: L.Map | null = null;

  marker: L.Marker | null = null;

  icon = {
    icon: L.icon({
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      iconUrl: 'data:image/svg+xml;base64,' + btoa('<?xml version="1.0" ?><svg height="24" version="1.1" width="24" xmlns="http://www.w3.org/2000/svg" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><g transform="translate(0 -1028.4)"><path d="m12 0c-4.4183 2.3685e-15 -8 3.5817-8 8 0 1.421 0.3816 2.75 1.0312 3.906 0.1079 0.192 0.221 0.381 0.3438 0.563l6.625 11.531 6.625-11.531c0.102-0.151 0.19-0.311 0.281-0.469l0.063-0.094c0.649-1.156 1.031-2.485 1.031-3.906 0-4.4183-3.582-8-8-8zm0 4c2.209 0 4 1.7909 4 4 0 2.209-1.791 4-4 4-2.2091 0-4-1.791-4-4 0-2.2091 1.7909-4 4-4z" fill="#e74c3c" transform="translate(0 1028.4)"/><path d="m12 3c-2.7614 0-5 2.2386-5 5 0 2.761 2.2386 5 5 5 2.761 0 5-2.239 5-5 0-2.7614-2.239-5-5-5zm0 2c1.657 0 3 1.3431 3 3s-1.343 3-3 3-3-1.3431-3-3 1.343-3 3-3z" fill="#c0392b" transform="translate(0 1028.4)"/></g></svg>')
    })
  };



  constructor(private http: HttpClient) {
  }


  posts: any;


  onSubmit() {
    if (this.imageSubmissionForm.invalid) {
      return;
    }
    console.log(JSON.stringify(this.imageSubmissionForm.value));
    // Initialize Params Object
    let Params = new HttpParams();
    // Begin assigning parameters
    Params = Params.append('firstParameter', this.imageSubmissionForm.value.firstName);
    return this.http.put('http://localhost:8000/submit'
      , JSON.stringify(this.imageSubmissionForm.value), { headers: { 'Content-Type': 'application/json' } }).subscribe(data => {
        this.posts = data;
        // show data in console
        console.log(this.posts);
      });

  }

  markerFromLatLong() {
    let siteFormControl = this.imageSubmissionForm.get('site');
    if (siteFormControl != null) {
      let latitude = siteFormControl.get('latitude')?.value;
      let longitude = siteFormControl.get('longitude')?.value;

      let position;
      try {
        position = new Coordinates(latitude + ", " + longitude);

        if (null != this.magnesiemap) {
          this.updateMap(position.getLatitude(), position.getLongitude());
        }
      } catch (error) {
        console.error("Invalid coodinates")
      }
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
    let siteFormControl = this.imageSubmissionForm.get('site');
    if (siteFormControl != null) {
      let siteLatitudeFormControl = siteFormControl.get('latitude');
      let siteLongitudeFormControl = siteFormControl.get('longitude');

      if (siteLatitudeFormControl != null && siteLongitudeFormControl != null) {
        siteLatitudeFormControl.setValue(e.latlng.lat);
        siteLongitudeFormControl.setValue(e.latlng.lat);
      }
      this.updateMap(e.latlng.lat, e.latlng.lng);
    }
  }


  ngOnInit() {
    // Déclaration de la carte avec les coordonnées du centre et le niveau de zoom.
    this.magnesiemap = L.map('magnesiemap').setView([46.5, 2.6], 5);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: 'Magnes.ie Map'
    }).addTo(this.magnesiemap);

    this.magnesiemap.on("click", this.placeMarker.bind(this));
  }
}
