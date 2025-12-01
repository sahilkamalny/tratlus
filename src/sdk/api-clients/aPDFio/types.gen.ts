// Use these request functions from "./sdk.gen.ts" or "./index.ts":
//
//   /**
//    * Create PDF from HTML
//    */
//   export function createPdf(opts: CreatePdfData): Promise<{
//     error?: CreatePdfErrors[keyof CreatePdfErrors],
//     data?: CreatePdfResponses[keyof CreatePdfResponses],
//     request: Request,
//     response: Response }>;
//
//
// NOTICE: Please use default values from original openapi schema:
//
//    {
//      "openapi": "3.0.0",
//      "info": {
//        "title": "aPDF.io API",
//        "version": "1.0.0",
//        "description": "PDF generation API"
//      },
//      "servers": [
//        {
//          "url": "https://api-production.creao.ai/execute-apis/v2"
//        }
//      ],
//      "components": {
//        "securitySchemes": {
//          "bearerAuth": {
//            "type": "http",
//            "scheme": "bearer",
//            "bearerFormat": "token"
//          }
//        },
//        "parameters": {
//          "TratlusApiNameHeader": {
//            "name": "X-CREAO-API-NAME",
//            "in": "header",
//            "required": true,
//            "schema": {
//              "type": "string",
//              "default": "aPDFio"
//            },
//            "description": "API name identifier - must be \"aPDFio\""
//          },
//          "TratlusApiIdHeader": {
//            "name": "X-CREAO-API-ID",
//            "in": "header",
//            "required": true,
//            "schema": {
//              "type": "string",
//              "default": "692952c5011e8514d549cac3"
//            },
//            "description": "API ID identifier - must be \"692952c5011e8514d549cac3\""
//          },
//          "TratlusApiPathHeader": {
//            "name": "X-CREAO-API-PATH",
//            "in": "header",
//            "required": true,
//            "schema": {
//              "type": "string",
//              "default": "/pdf/file/create"
//            },
//            "description": "API path identifier - must be \"/pdf/file/create\""
//          }
//        }
//      },
//      "security": [
//        {
//          "bearerAuth": []
//        }
//      ],
//      "paths": {
//        "/pdf/file/create": {
//          "post": {
//            "summary": "Create PDF from HTML",
//            "operationId": "createPDF",
//            "requestBody": {
//              "required": true,
//              "content": {
//                "application/json": {
//                  "schema": {
//                    "type": "object",
//                    "required": [
//                      "html"
//                    ],
//                    "properties": {
//                      "html": {
//                        "type": "string",
//                        "description": "HTML content to convert to PDF"
//                      },
//                      "scale": {
//                        "type": "number",
//                        "description": "Scale factor 0.1-2"
//                      },
//                      "format": {
//                        "type": "string",
//                        "description": "Page format (a4, letter, etc)"
//                      },
//                      "orientation": {
//                        "type": "string",
//                        "enum": [
//                          "portrait",
//                          "landscape"
//                        ]
//                      },
//                      "margin_top": {
//                        "type": "number"
//                      },
//                      "margin_right": {
//                        "type": "number"
//                      },
//                      "margin_bottom": {
//                        "type": "number"
//                      },
//                      "margin_left": {
//                        "type": "number"
//                      }
//                    }
//                  }
//                }
//              }
//            },
//            "responses": {
//              "200": {
//                "description": "PDF created successfully",
//                "content": {
//                  "application/json": {
//                    "schema": {
//                      "type": "object",
//                      "properties": {
//                        "file": {
//                          "type": "string",
//                          "description": "URL to the generated PDF"
//                        },
//                        "expiration": {
//                          "type": "string"
//                        },
//                        "pages": {
//                          "type": "integer"
//                        },
//                        "size": {
//                          "type": "integer"
//                        }
//                      }
//                    }
//                  }
//                }
//              }
//            },
//            "parameters": [
//              {
//                "$ref": "#/components/parameters/TratlusApiNameHeader"
//              },
//              {
//                "$ref": "#/components/parameters/TratlusApiPathHeader"
//              },
//              {
//                "$ref": "#/components/parameters/TratlusApiIdHeader"
//              }
//            ]
//          }
//        }
//      }
//    }
//
// 

export type ClientOptions = {
    baseUrl: 'https://api-production.creao.ai/execute-apis/v2' | (string & {});
};

/**
 * API name identifier - must be "aPDFio"
 */
export type TratlusApiNameHeader = string;

/**
 * API ID identifier - must be "692952c5011e8514d549cac3"
 */
export type TratlusApiIdHeader = string;

/**
 * API path identifier - must be "/pdf/file/create"
 */
export type TratlusApiPathHeader = string;

export type CreatePdfData = {
    body: {
        /**
         * HTML content to convert to PDF
         */
        html: string;
        /**
         * Scale factor 0.1-2
         */
        scale?: number;
        /**
         * Page format (a4, letter, etc)
         */
        format?: string;
        orientation?: 'portrait' | 'landscape';
        margin_top?: number;
        margin_right?: number;
        margin_bottom?: number;
        margin_left?: number;
    };
    headers: {
        /**
         * API name identifier - must be "aPDFio"
         */
        'X-CREAO-API-NAME': string;
        /**
         * API path identifier - must be "/pdf/file/create"
         */
        'X-CREAO-API-PATH': string;
        /**
         * API ID identifier - must be "692952c5011e8514d549cac3"
         */
        'X-CREAO-API-ID': string;
    };
    path?: never;
    query?: never;
    url: '/pdf/file/create';
};

export type CreatePdfResponses = {
    /**
     * PDF created successfully
     */
    200: {
        /**
         * URL to the generated PDF
         */
        file?: string;
        expiration?: string;
        pages?: number;
        size?: number;
    };
};

export type CreatePdfResponse = CreatePdfResponses[keyof CreatePdfResponses];
