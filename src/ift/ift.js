"use strict";

 /* Copyright 2018 Open Ag Data Alliance
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 /**
 * @author Servio Palacios
 * IFT - IBM Food Trust Super Class.
 * @module src/ift
 *
 */
const axios = require('axios');
const pretty = require('prettyjson');
const fs = require("fs");

class IFT {

    constructor(param = {}){
        let self = this;
        self._path = param.path;
        self._connected = false;
        self._onboarding_token_in_header = false;
        self._onboarding_file_name = "./onboarding_token";

        /* oraganization id */
        self._organization_id = "c6cf401e-3d53-4353-85f8-37e4324504ea";
        /* IAM_TOKEN related */
        self._iam_path = "https://iam.ng.bluemix.net/oidc/token";
        self._iam_header = {"Content-Type": "application/x-www-form-urlencoded"};
        self._api_key = "NpjjvJtggno3uJ2au7Gb7NZxu05ncRPKaJGlPjZnnJeL";
        self._grant_type = "urn:ibm:params:oauth:grant-type:apikey";
        self._iam_body = {
            "apikey": "NpjjvJtggno3uJ2au7Gb7NZxu05ncRPKaJGlPjZnnJeL",
            "grant_type": "urn:ibm:params:oauth:grant-type:apikey"
        };
        self._iam_returned_url = "https://fs-identity-proxy-integration.mybluemix.net/exchange_token/v1/organization/c6cf401e-3d53-4353-85f8-37e4324504ea";
        self._IAM_TOKEN = {}; 

        /* onboarding token related */
        /* this is the one used to interact with IFT API */
        self._onboarding_path = "https://fs-identity-proxy-integration.mybluemix.net/exchange_token/v1/organization/c6cf401e-3d53-4353-85f8-37e4324504ea";
        self._onboarding_header = {"Content-Type": "application/json"};
        self._ONBOARDING_TOKEN = ""; 

        /* Certificates */
        self._certificates_path = "https://fs-certificate-management-integration.mybluemix.net/v2/certifications"; //?to=2019-01-01&facilities=false
        self._certificates_point_query_path = "https://fs-certificate-management-integration.mybluemix.net/v2/certifications/";
        self._certificates_header = {"Accept": "application/json"};

        //previous dc6c0edd1b009be80fe7130cccd9b0dd
        //reference number 81865f679afd39ba1543244eee910b79
        //certificationId: 'e4f7e5e74f996ff2b07783c2d882c7d7'
        self._certificate_template = {
          "addendumsComments": "trellis-certification-test-03",
          "announced": "Announced",
          "auditRating": "Grade A",
          "auditReferenceNumber": "dc6c0edd1b009be80fe7130cccd9b0da",
          "auditScore": "NA",
          "auditStartDate": "2018-07-01",
          "auditType": "NA",
          "auditedBy": "trellis",
          "certificateReferenceNumber": "81865f679afd39ba1543244eee910b70",
          "certificationStatus": "valid",
          "comments": "trellis comment",
          "expiryDate": "2019-01-01",
          "issueDate": "2018-08-16",
          "locationGLNList": [
            "0728612177446"
          ],
          "productHandlingIncluded": "false",
          "scheme": "BRC Global Standard for Food Safety",
          "schemeOwner": "BRC",
          "scope": "Agents and Brokers: 01 – Raw milk and prepared foods"
        }

        self._certificate_test = {
            "addendumsComments": "Test",
            "announced": "Announced",
            "auditRating": "Grade A",
            "auditReferenceNumber": "dc6c0edd1b009be80fe7130cccd9b0dd",
            "auditScore": "NA",
            "auditStartDate": "2018-07-01",
            "auditType": "NA",
            "auditedBy": "test",
            "certificateReferenceNumber": "81865f679afd39ba1543244eee910b79",
            "certificationStatus": "valid",
            "comments": "comment",
            "expiryDate": "2019-01-01",
            "issueDate": "2018-08-16",
            "locationGLNList": [
              "0728612177445"
            ],
            "productHandlingIncluded": "false",
            "scheme": "BRC Global Standard for Food Safety",
            "schemeOwner": "BRC",
            "scope": "Agents and Brokers: 01 – Raw meat, fish and prepared foods"
          }

        self._certificate_id = '668d6fb0a6f4aa602a7c45cc00e309f6';//"e4f7e5e74f996ff2b07783c2d882c7d7";

        self._certificate_delete_path_leftover = "/attachments/certificate";
    }//constructor

    _mapOada2Hyperledger(_primusgfs){
        let self = this;
        return self._certificate_template;
    }//_mapOada2Hyperledger

    _getIAMTokenFromResponse(response){
        let self = this;
        let tempToken = response;
        Object.keys(tempToken || {}).map( (key) => {
            if(key !== self._iam_returned_url){
                self._IAM_TOKEN[key] = tempToken[key];
            }
        });
        console.log("--> [IBM_AIM_TOKEN] --> ", pretty.render(self._IAM_TOKEN));
    }//_getIAMTokenFromResponse

    _printOnboardingToken(){
        let self = this;
        console.log("[ONBOARDING_TOKEN]", pretty.render(self._ONBOARDING_TOKEN));
    }

    async _readOnboardingTokenFromFile(){
       let self = this;
       self._result = false;
       fs.readFile(self._onboarding_file_name, 'utf8', function readFileCallback(err, data){
            if (err){
                console.log("[Error] - [reading from file]", err);
            } else {
               
                self._ONBOARDING_TOKEN = JSON.parse(data); 
                console.log("[ONBOARDING_TOKEN] - [EXISTS] - [reading from file]");
                self._printOnboardingToken();
                self._result = true;
            }
        });   
        // console.log('reading file-->', self._result);
        return await self._result;
    }//_readOnboardingTokenFromFile

    async connect(){
       let self = this;

       if(!await self._readOnboardingTokenFromFile()) {
            /* getting IBM Cloud IAM token */
            return self.post(self._iam_path, self._iam_header, self._iam_body).then( (response) => {
                self._getIAMTokenFromResponse(response.data);
                
                /* getting onboarding token */
                return self.post(self._onboarding_path, self._onboarding_header, "", self._IAM_TOKEN).then( (response) => {
                    self._ONBOARDING_TOKEN = response.data;
                    self._connected = true;
                    console.log("[CONNECTED]");
                    fs.writeFile(self._onboarding_file_name, JSON.stringify(self._ONBOARDING_TOKEN), (response) => {console.log('File written', response);} );
                    this._printOnboardingToken();
                }).catch((error) => {
                    console.log("[ERROR] - [ONBOARDING TOKEN]", error);
                });

            }).catch((error) => {
                console.log("[ERROR] - [IAM TOKEN]", error);
                return null;
            });
        } else {
            console.log("[ALREADY CONNECTED]");
            this._printOnboardingToken();
            self._connected = true;
            
            return Promise.resolve("Connected");
        }
       
    }//connect

    get(_path, _headers){
        let self = this;
            
        return axios({
            method: "get",
            url: _path || self._path,
            headers: _headers || ""
        }).catch((err) => {
            console.log('[GET ERROR] ->', err)
        });

    }//get

    del(_path, _headers){
        return axios({
            method: "delete",
            url: _path,
            headers: _headers || "",
        }).catch((err) => {
            console.log('[DELETE ERROR] ->', err)
        });
    }//del

    put(path, data){
        let self = this;
        
        return axios({
            method: "put",
            url: "https://localhost",
            headers: opts.headers
        }).catch((err) => {
            console.log('[PUT ERROR] ->', err)
        });
    }//put

    post(_path, _headers, _params, _data){
        let self = this;

        return axios({
            method: "post",
            url: _path,
            data: _data,
            params: _params,
            headers: _headers || ""
        }).catch((err) => {
            console.log('[POST ERROR] ->', err)
        })

    }//post

    _buildCertificatesHeader(){
        let self = this;
        self._certificates_header = {"Authorization": "Bearer " + self._ONBOARDING_TOKEN["onboarding_token"]};
        self._onboarding_token_in_header = true;
    }

    putCertificate(_primusgfs){
        let self = this;
        console.log("[ADDING] - [CERTIFICATE]");
        if(self._connected){
            if(!self._onboarding_token_in_header){
                self._buildCertificatesHeader();
            }

            self.post(self._certificates_path, self._certificates_header, "", this._mapOada2Hyperledger(_primusgfs)).then((response) => {
                //console.log('newCertificate', response);
                return response.data.certificationId;
            }).catch((err) => {
                return null;
            });
        }
        else{
            console.log("[Not connected]");
        }
    }//addCertificate

    delCertificate(){
        let self = this;
        console.log("[DELETING] - [CERTIFICATE]");
        if(self._connected){
            if(!self._onboarding_token_in_header){
                self._buildCertificatesHeader();
            }
            let _path = self._certificates_point_query_path + self._certificate_id + self._certificate_delete_path_leftover;
            
            self.del(_path, self._certificates_header).then((response) => {
                console.log('delCertificates', response);
            });
        }
        else{
            console.log("[Not connected]");
        }
    }//deleteCertificate

    getCertificate(_certificationId){
        let self = this;
        console.log("[FETCHING] - [CERTIFICATE]");
        if(self._connected){
            if(!self._onboarding_token_in_header){
                self._buildCertificatesHeader();
            }
            let _path = _certificationId ? self._certificates_point_query_path + _certificationId : self._certificates_path;
            //console.log("Certificates Header", self._certificates_header);
            self.get(_path, self._certificates_header).then((response) => {
                console.log('getCertificates', response);
                return response.data;
            }).catch( (err) => {
                console.log("[Error]");
                return null;
            });
        }
        else{
            console.log("[Not connected]");
        }
    }//getCertificate

    /**
     *  waits for connection to be established then sends request for a certificate
     **/
    getCertificateManager(_certificationId){
        let self = this;
        if(!self._connected){
            setTimeout(self.getCertificate(_certificationId).then((response) => {console.log(response)}), 100); 
        }
        else{
            return self.getCertificate();
        }
    }//getCertificateManager

}//class

/* exporting the module */
module.exports = IFT;