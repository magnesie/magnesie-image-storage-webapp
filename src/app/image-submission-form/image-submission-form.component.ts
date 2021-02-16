import { Component, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';

@Component({
    selector: 'app-image-submission-form',
    templateUrl: './image-submission-form.component.html',
    styleUrls: ['./image-submission-form.component.css']
})

export class ImageSubmissionFormComponent implements OnInit {

    imageSubmissionForm = new FormGroup({
        name: new FormControl('', [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(30)
        ])
    });

    constructor(private http: HttpClient) { }

    ngOnInit(): void { }

    posts: any;


    @Output()
    onSubmit() {
        if (this.imageSubmissionForm.invalid) {
            return;
        }

        console.log();

        // Initialize Params Object
        let Params = new HttpParams();
        // Begin assigning parameters
        Params = Params.append('firstParameter', this.imageSubmissionForm.value.firstName);
        return this.http.put('http://localhost:8000/user'
            , JSON.stringify(this.imageSubmissionForm.value)).subscribe(data => {
                this.posts = data;
                // show data in console
                console.log(this.posts);
            });

    }

    get name() { return this.imageSubmissionForm.get('name'); }
}

