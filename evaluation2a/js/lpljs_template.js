/**!
 * LPL JavaScript Library v 1.0
 *
 * Created by Florian Prey on 14.03.17.
 */


/**
 * @type {{lplJSON: {}, setDefault: lpl.setDefault, create: lpl.create, start: lpl.start, reload: lpl.reload, setLang: lpl.setLang, updateLpl: lpl.updateLpl, handleInteraction: lpl.handleInteraction, findTranslation: lpl.findTranslation, addIcon: lpl.addIcon, addPurpose: lpl.addPurpose, addData: lpl.addData, addRecipientPanel: lpl.addRecipientPanel, addRecipient: lpl.addRecipient, addRetentionPanel: lpl.addRetentionPanel, addRetention: lpl.addRetention, addPrivacyPanel: lpl.addPrivacyPanel, addPrivacy: lpl.addPrivacy, setHeader: lpl.setHeader, setURL: lpl.setURL, handleTemplate: lpl.handleTemplate, toggleContent: lpl.toggleContent, handleLplToContent: lpl.handleLplToContent, handleTabs: lpl.handleTabs, handleLPL: lpl.handleLPL, finish: lpl.finish}}
 * LPL global element
 * If used, then should there be no other global lpl var, otherwise it will be overwritten
 */
var lpl = {
    lplJSON : {},
    /**
     * If no other config provided, this default config will be loaded into lpl.
     */
    setDefault : function() {
        //Available anoymisatzion mehtods
        lpl.anonymizations = ["SUPPRESSION", "GENERALIZATION", "DELETION"];

        //Translations - can be edited, or another translation loaded via config
        lpl.translation = {
            SUPPRESSION: {"de": "Bei Suppression wird der eingegebene Wert an so vielen Stellen verändert, bis er mit andere Werten übereinstimmt.",
                "en": "At a supression the letters of the inserted value will be changed so often, till it fits other values.",
                "exampleList": ["Teststraße 1", "Teststraß###", "Testst######", "Tes#########",  "############"]},
            GENERALIZATION: {"de": "Bei Generalization wird der Wert zu einem Bereich hinzugefügt um dem Privacy Model zu entsprechen. Beispiel Alter.",
                "en": "At a generalisation the value will be splitted in different sectors to fit the privacy model. For example age.",
                "exampleList": ["25", "23-27", "20-30", "0-50", "*"]},
            DELETION: {"de": "Daten werden für die Anonymisierung gelöscht",
                "en": "Data will be deleted for anonymization purpose",
                "exampleList": ["Teststraße 1", ""]},
            USEDDATA: {"de": "Welche Daten werden wie genutzt?", "en": "Which Data is used and how?"},
            ANONYMIZATION: {"de": "Anonymisierung", "en": "Anonymisation", DATAGROUP: {"de": "Datengruppe", "en": "Datagroup"},
                METHOD: {"de": "Methode", "en": "Method"}},
            RECEIVER:{"de": "Wer ist der Empfänger meiner Daten?", "en": "Who is the receiver of my data?"},
            RETENTION: {"de": "Wie lange werden meine Daten gespeichert?", "en": "How long will my data be saved?"},
            PRIVACY: {"de": "Wie sicher werden meine Daten anonymisiert?", "en": "How secure will my data be anonymised?",
                PROBABILITY: {"de": "Wahrscheinlichkeit das ich in einem anonymisierten Datensatz identifiziert werden: ", "en": "With what probability I can be identified in an anonymised dataset: "}},
            NOPRIVACY: {"de": "Daten werden nicht anonymisiert.", "en": "Data won't be anonymized."},
            ACCEPT: {"de": "aktzeptieren", "en": "accept"},
            REQUIRED: {"de": "erforderlich", "en": "required"},
            OVERVIEW: {"de": "Übersicht", "en": "Overview"},
            PURPOSE: {"de": "Zwecke der Datenverarbeitung", "en": "Purpose of Data Porcessing"},
            LINK: {"de": "Rechtliche Datenschutzerklärung", "en": "Legal Pirvacy Policy"},
            EXAMPLE: {"de": "Beispiel", "en": "Example"},
            DESCRIPTION: {"de": "Beschreibung", "en": "Description"},
            SAVEBUTTON: {"de": "Speichern und aktzeptieren", "en": "save and accept"},
            HIERARCHY: {"de": "Daten Hierarchien", "en": "Dara Hierarchy"},
            FIXEDDATE: {"de": "Löschdatum", "en": "Retention date"}
        };

        //Default lang - can be edited via config
        lpl.lang = "de";

        //HTML Templates for simple, slider and specific - can be selected via config
        lpl.template = '<div class="panel panel-default"><div class="panel-heading">'+
                '<h3><span class="header"></span><small class="text-right pull-right"><a class="privacy-link" target="_blank"></a>'+
                '</small></h3></div><div class="panel-body lpl-body"><div class="row"><div class="panel panel-default" style="margin: 0px 10px;">'+
                '<div class="panel-heading"><h4 class="overview-header"></h4></div><div class="panel-body">'+
                '<div class="row overview-icon" ></div></div></div></div><div class="row"><div class="col-sm-4">'+
                '<div class="list-group" id="purposeList"><div class="list-group-item disabled purpose-header"></div>'+
                '</div></div><div class="col-sm-8" id="lplcontent"></div></div></div></div>';

        //Default Tabs that should be loaded - can be edited via config
        lpl.loadTemplate = "default";

        //Default element
        lpl.element = "lplTemplate";

        //Default Result element
        lpl.lplRes = "lplRes";

        //Button can be <a> tag or <button> tag
        lpl.atag = true;

        //Should the click on save or export button trigger closest form
        lpl.triggerForm = false;

        //Default class for save button
        lpl.saveButton = "save-button";

        //Should the save button be translated?
        lpl.translateSaveButton = true;

        //Default Load function
        lpl.lplLoad = "ajax";

        //Default LPL File
        lpl.lplRaw = "lpl.json";
    },
    /**
     * @param elementId - Id of the HTML element where LPL should be loaded
     * @param config - JSON Object containing a specific LPL configuration
     * The create function should be called by the user to hand over the different LPL configurations
     */
    create : function (elementId, config) {
        //set LPL Element
        lpl.element = elementId;

        //Load default Values
        lpl.setDefault();

        //if config is set, load config into LPL
        if(config != undefined) {
            lpl.config = config;
        } else {
            lpl.config = {};
        }

        //Check if LPL is ready (JQuery loaded) and if so start LPL
        if(lpl.ready) {
            lpl.start();
        }
    },

    /**
     * If Document is ready, this is the main function should be started by the library itself
     */
    start : function () {

        //Change LPL Config if in config object
        if(lpl.config.lplLoad != undefined) {
            lpl.lplLoad = lpl.config.lplLoad;
        }
        if(lpl.config.lplRaw != undefined) {
            lpl.lplRaw = lpl.config.lplRaw;
        }

        //Load LPL Model
        lpl.handleLPL(lpl.config.lplLoad, lpl.config.lplRaw, function () {

            if(lpl.config != undefined) {
                //set Language
                lpl.setLang(lpl.config.lang, lpl.lplJSON.lang, lpl.config.translation);
                //set template config
                lpl.templateConfig(lpl.config);
            }

            //Handle Template of HTML
            lpl.handleTemplate(lpl.config.view);

            //Should LPL be loaded in creator view?
            if(lpl.config.createView) {
                if(lplCreate != undefined) {
                    lplCreate.create(lpl.lang, lpl.config.viewLang, lpl.config.createTranslation, lpl.config.createTemplate, lpl.config.createIcon);
                } else {
                    console.error("Libary Error! lplcreate.js not loaded!");
                }
            }
            //LPL is loaded, dismiss Loading screen and display LPL
            lpl.finish();
        });
    },
    /**
     * @param lplJson - new LPLJson that should be loaded
     * If another layer is added or selected, or a different LPLJson config is loaded, the HTML of LPL should be reloaded
     */
    reload : function (lplJson) {
        // set new LPL version
        lpl.lplJSON = lplJson;
        //Add loader class, to show loading screen
        $('#lplTemplate').addClass('loader');

        if(lpl.config != undefined) {
            //set Language
            lpl.setLang(lpl.config.lang, lpl.lplJSON, lpl.config.translation);
            //set template config
            lpl.templateConfig(lpl.config);
        }

        //Handle Template
        lpl.handleTemplate(lpl.config.view);

        //If in creator view - reload
        if(lpl.config.createView) {
            if(lplCreate != undefined) {
                lplCreate.reload(lpl.lang, lpl.config.viewLang, lpl.config.createTranslation, lpl.config.createTemplate, lpl.config.createIcon);
            } else {
                console.error("Libary Error! lplcreate.js not loaded!");
            }
        }

        //LPL is loaded, dismiss Loading screen and display LPL
        lpl.finish();

    },
    /**
     * Overwrite default config if user enters other values
     * @param config
     */
    templateConfig : function (config) {
        //Set Result element
        if(config.lplRes != undefined) {
            lpl.lplRes = config.lplRes;
        }
        if(config.template != undefined) {
            lpl.template = config.template;
        }
        if(config.loadTemplate != undefined) {
            lpl.loadTemplate = config.loadTemplate;
        }
        if(config.anonymizations != undefined) {
            lpl.anonymizations = config.anonymizations;
        }
        if(config.atag != undefined) {
            lpl.atag = config.atag;
        }
        if(config.triggerForm != undefined) {
            lpl.triggerForm = config.triggerForm;
        }
        if(config.saveButton != undefined) {
            lpl.saveButton = config.saveButton;
        }
        if(config.translateSaveButton != undefined) {
            lpl.translateSaveButton = config.translateSaveButton;
        }
    },
    /**
     * This function provides different methods to load the LPLJson File into the lpl variable:
     * html - Load JSON into an HTML hidden input
     * json - Load the JSON Object directly into the config object,
     * data - pass JSON object via data attribute in the script tag
     * ajax - load JSON file extern via an AJAX request
     * @param lplLoad - method that should be used
     * @param lplRaw - has different uses depending on method:
     * html - id of the hidden input with the JSON object
     * json - has the JSON object already
     * ajax - directory of the JSON File
     * @param onLplLoad - function to execute after LPL Config loaded.
     */
    handleLPL : function (lplLoad, lplRaw, onLplLoad) {
        if(!lplLoad) {
            console.error("Config Error! lplLoad not set!");
        } else {
            switch (lplLoad) {
                case "html":
                    if (lplRaw) {
                        //Load Value from HTML Element and parse into JSON
                        var data = $.parseJSON($('#' + lplRaw).val());
                        lpl.lplFull = lpl.lplJSON;
                        lpl.lplJSON = data.layeredPrivacyPolicy;
                        onLplLoad();
                    } else {
                        console.error("Config Error! lplRaw not set!");
                    }
                    break;
                case "json":
                    if (lplRaw) {
                        //Load directly from LPLRaw
                        lpl.lplJSON = lplRaw.layeredPrivacyPolicy;
                        lpl.lplFull = lpl.lplJSON;
                        onLplLoad();
                    } else {
                        console.error("Config Error! lplRaw not set!");
                    }
                    break;
                case "data":
                    //Get script tag  where lpl file is loaded
                    var scriptFile = $('script[src*=lpljs]');
                    //Get the data attribute from script tag
                    var lplDataRaw = scriptFile.attr('data-lpl');
                    if (typeof lplDataRaw === "undefined" ) {
                        console.error("Config Error! lplRaw not set!");
                    } else {
                        //parse to JSON
                        var data = $.parseJSON(lplDataRaw);
                        lpl.lplJSON = data.layeredPrivacyPolicy;
                        lpl.lplFull = lpl.lplJSON;
                        onLplLoad();
                    }
                    break;
                case "ajax":
                    if(lplRaw) {
                        //Load file via ajax
                        $.getJSON(lplRaw, function (data) {
                            lpl.lplJSON = data.layeredPrivacyPolicy;
                            lpl.lplFull = lpl.lplJSON;
                            onLplLoad();
                        })
                    } else {
                        console.error("Config Error! lplUrl not set!");
                    }
                    break;
            }
        }
    },
    /**
     * Check if HTML template is in js-file or load extern via ajax
     */
    handleTemplate : function (view) {
        var element = lpl.element;
        if(lpl.loadTemplate == "html") {
            //Load template extern via ajax
            $('#' + element).load(lpl.template, function () {
                lpl.appendHTML(view);
                lpl.handleInteraction();
            });
        } else {
            //insert template into html element
            $('#'+element).append(lpl.template);
            lpl.appendHTML(view);
            lpl.handleInteraction();
        }
    },
    /**
     * Append the remaining attributes from the LPLJson File to the HTML
     */
    appendHTML : function(view) {
        var lang = lpl.lang;
        //Set Link
        lpl.setURL(lpl.lplJSON.privacyPolicyUri);
        //Set Link translation
        $('.privacy-link').html(lpl.translation.LINK[lang]);
        //Set text on save Button
        if(lpl.translateSaveButton != undefined) {
            if(lpl.atag) {
                $('.'+lpl.saveButton).html(lpl.translation.SAVEBUTTON[lang]);
            } else {
                $('.'+lpl.saveButton).val(lpl.translation.SAVEBUTTON[lang]);
            }
        }
        //Set Header for overview
        $('.overview-header').html(lpl.translation.OVERVIEW[lang]);
        //Set Header for purposes
        $('.purpose-header').html(lpl.translation.PURPOSE[lang]);
        //Set general header
        lpl.setHeader(lpl.lplJSON.headerList, lang);

        if(view == undefined || view.icons == undefined || view.icons)
        //Iterate over all icons
        $.each(lpl.lplJSON.iconList.icon, function(index, value) {
            lpl.addIcon(value, lang);
        });
        //iterate over all purposes
        $.each(lpl.lplJSON.purposeList.purpose, function (index, value) {
            lpl.addPurpose(value.name, value, view, lang);
        });
        //Set first purpose as active
        $('.elementInfo:first').removeClass('collapse');
        $('.purposeList:first').addClass('active');
    },
    /**
     * load translation and default language from user config if provided, as fallback use language from LPLJSON File
     * @param configLang - default language from user config
     * @param jsonLang - Language provide from LPLJson File
     * @param configTranslation - Translations provided via user config
     */
    setLang : function (configLang, jsonLang, configTranslation) {
        if(configTranslation != undefined) {
            //When a new language is added via config, merge it to existing ones, otherwise this overwrites it.
            $.extend(true, lpl.translation, configTranslation);
        }
        //If a different language is set in the config, overwrite it
        if(configLang != undefined) {
            lpl.lang = configLang;
        } else {
            //Fallback, if no language is defined in the config, use it from LPL File
            if(jsonLang != undefined) {
                lpl.lang = jsonLang;
            }
        }
    },
    /**
     * When user disagres purpose -> update LPLJson
     * @param type - where did the user click?
     * @param direction - did he agree or disagree?
     * @param index - index of the purpose selected
     */
    updateLpl : function (type, direction, purpose) {
        switch (type) {
            case 'globalclick':
                lpl.lplJSON.accepted = direction.toString();
                break;
            case 'purposeclick':
                $.each(lpl.lplJSON.purposeList.purpose, function (index, value) {
                    if(value.name == purpose) {
                        value.accepted = direction;
                    }
                });
                break;
        }
        $('#'+lpl.lplRes).val(JSON.stringify(lpl.lplJSON));
    },
    /**
     * Handle the interactions for accepting and declining with the different templates
     * @param template - template for which the interaction should be used
     */
    handleInteraction: function () {
        $('#'+lpl.lplRes).val(JSON.stringify(lpl.lplJSON));
        $(document).ready(function () {
            $('input[name=lpl-specific]').click( function () {
                lpl.updateLpl('purposeclick', $(this).is(':checked'), $(this).val());
            });
            $('input[name=lpl-global]').click( function () {
                lpl.updateLpl('globalclick', $(this).is(':checked'));
            });
        });
    },
    /**
     * function takes the list provided by LPLJson and selects the translation for the active language
     * @param list - List of translations
     * @param lang - active language
     * @returns {string} - Text in the active language
     */
    findTranslation : function (list, lang) {
        var retValue = "";
        if(list != undefined) {
            //Iterate over each element in List
            $.each(list.label, function (index, value) {
                //If value is found, set variable and break iteration
                if (value.lang == lang) {
                    retValue = value.value;
                    return;
                }
            });

            //If translation found -> return value
            if (retValue != "") {
                return retValue;
            } else {
                console.error("Fehler! Übersetzung nicht gefunden!")
            }
        } else {
            console.error("Fehler! JSON Datei im falschen Format!")
        }
    },

    /**
     * Add LPL Icons to HTML
     * @param value - Icon Object provided by LPLJson File
     * @param lang - Active language
     */
    addIcon : function(value, lang) {
        $('.overview-icon').prepend('<div class="col-sm-3 text-center">' +
            '<span title="'+lpl.findTranslation(value.descriptionList, lang) + '" class="' + value.name + ' lplicon'+value.name+'" style="font-size: 50px;"></span><br />'
            + lpl.findTranslation(value.headerList, lang) + '</div>');
    },
    /**
     * Set header in HTML
     * @param headerList - List of different translations
     * @param lang - active language
     */
    setHeader : function(headerList, lang) {
        $('.header').html(lpl.findTranslation(headerList, lang));
    },
    /**
     * Set Link to default privacy policy
     * @param url - HTTP Link
     */
    setURL : function(url) {
        if(url != undefined && url != "") {
            //Check if url starts with http(s)://, if not add http:// create outgoing link
            if (url.substring(0, 7) == "http://" || url.substring(0, 8) == "https://") {
                $('.privacy-link').attr("href", url);
            } else {
                $('.privacy-link').attr("href", "http://" + url);
            }
        }
    },
    /**
     * Get the values from the LPLJson File and creates the HTML
     * @param index - identifier for the purpose
     * @param value - purpose object
     * @param view - view object, defines which views should be active
     * @param lang - active language
     */
    addPurpose : function(index, value, view, lang) {
        //Append Link to purpose list and make link toggle content
        $('#purposeList .purpose-header:first-child').after('<a id="purposeLink' + index + '" onclick="lpl.toggleContent(this, \'elementInfo\', \'lpl' + index + '\', \'purposeList\')" class="list-group-item purposeList" title="'+lpl.findTranslation(value.headerList, lang) + '">' + lpl.findTranslation(value.headerList, lang) + '</a>');
        //Cut name if to long
        if($('#purposeLink'+index).html().length > 30) {
            $('#purposeLink' + index).html($('#purposeLink' + index).html().substr(0, 27)+'...');
        }

        $('#lplcontent').append('<div class="row elementInfo collapse" id="lpl' + index + '"></div>');
        if (value.required != true) {
            $('#purposeLink' + index).append('<div class="pull-right">' + lpl.translation.ACCEPT[lang] + ' <input type="checkbox" class="lpl-specific" name="lpl-specific" value="' + index + '" /></div>');
        } else {
            $('#purposeLink' + index).append('<div class="pull-right">' + lpl.translation.REQUIRED[lang] + ' <input type="checkbox" disabled checked /></div>');
        }

        //Append discription and data list
        $('#lpl' + index).append('<div id="main' + index + '"><div class="page-header"><h3>' + lpl.findTranslation(value.headerList, lang) + '</h3></div><p>' + lpl.findTranslation(value.descriptionList, lang) + '</p></div>');
        //Display datalist if not explizit switched off
        if (view == undefined || view.data == undefined || view.data) {
            $('#main' + index).append('<div class="panel panel-default">' +
                '<div class="panel-heading data-panel-heading-'+index+'"><a onclick="$(\'#dataPanel' + index + '\').toggle(200)">' + lpl.translation.USEDDATA[lang] + '</a></div>' +
                '<div class="panel-body collapse row" id="dataPanel' + index + '"><div class="list-group col-sm-5" id="dataList' + index + '"></div><div class="col-sm-7" id="dataBody' + index + '"></div></div></div>');
            $.each(value.dataList.data, function (indexData, valueData) {
                lpl.addData(index, valueData, view, lang);
            });
        }
        $('.dataMain' + index + ':first').removeClass('collapse');
        $('.dataList' + index + ':first').addClass('active');
        //display recipient panel if not explizit switched off
        if ((view == undefined || view.recipient == undefined || view.recipient)) {
            lpl.addRecipientPanel(index, value.dataRecipientList.dataRecipient, lang);
        }
        //display retention panel if not explizit switched off
        if(view == undefined || view.retention == undefined || view.retention) {
            lpl.addRetentionPanel(index, value.retention, lang);
        }
        //display privacy if not explizit switched off
        if(view == undefined || view.privacy == undefined || view.privacy) {
            lpl.addPrivacyPanel(index, value.privacyModelList.privacyModel, lang);
        }
    },
    /**
     * Appends all data elements and their anonymization method from the LPLJson to the datalist
     * @param index - index of the purpose
     * @param valueData - data object from LPLJson
     * @param view - view object, defines which views should be active
     * @param lang - active language
     */
    addData : function(index, valueData, view, lang) {
        $('#dataList' + index).append('<a onclick="lpl.toggleContent(this, \'dataMain' + index + '\', \'dataMain' + index + valueData.name + '\', \'dataList' + index + '\')" class="list-group-item dataList'+index+valueData.name+' dataList' + index + '">' + lpl.findTranslation(valueData.headerList, lang) + '</a>');
        $('#dataBody' + index).append('<div class="dataMain' + index + ' collapse" id="dataMain' + index + valueData.name + '"><div class="page-header"><h4>' + lpl.findTranslation(valueData.headerList, lang) + '</h4></div><p>' + lpl.findTranslation(valueData.descriptionList, lang) + '</p><div class="row" id="dataAnon' + index + valueData.name + '"></div></div>')
        if (view == undefined || view.anonymization == undefined || view.anonymization) {
            $('#dataAnon' + index + valueData.name).append('<div class="col-sm-6 "><b>Anonymisierungsmethode:</b> ' + lpl.findTranslation(valueData.anonymizationMethod.headerList, lang) + '<br /><br /><b>' + lpl.translation.DESCRIPTION[lang] + '</b><br />' + lpl.findTranslation(valueData.anonymizationMethod.descriptionList, lang) + '</div>');
            $('#dataAnon' + index + valueData.name).append('<div class="col-sm-6" id="example' + index + valueData.name + '"><b>' + lpl.translation.HIERARCHY[lang] + '</b><br /></div>');
            //Iterate over list of configurated anoymisations to find the right one
            $.each(lpl.anonymizations, function (indexAnon, valueAnon) {
                if (valueData.anonymizationMethod.name == valueAnon) {
                    //Check if already an hierarchy is available
                    if (valueData.anonymizationMethod.hierarchy.HierarchyEntryList.HierarchyEntry.length > 0) {
                        $.each(valueData.anonymizationMethod.hierarchy.HierarchyEntryList.HierarchyEntry, function (indexExample, valueExample) {
                            $('#example' + index + valueData.name).append(valueExample + '<br />');
                        });
                    //If not display dummy hierarchy
                    } else {
                        $.each(lpl.translation[valueAnon].exampleList, function (indexExample, valueExample) {
                            $('#example' + index + valueData.name).append(valueExample + '<br />');
                        });
                    }

                }
            });
        }
    },
    /**
     * Creates an Panel to display all recipients
     * @param index - index of the purpose
     * @param value - recipient object from the LPLJson
     * @param lang - active language
     */
    addRecipientPanel : function(index, value, lang) {
        $('#main' + index).append('<div class="panel panel-default">' +
            '<div class="panel-heading recipient-panel-heading-'+index+'"><a onclick="$(\'#recipientPanel' + index + '\').toggle(200)">' + lpl.translation.RECEIVER[lang] + '</a></div>' +
            '<div class="panel-body collapse row" id="recipientPanel' + index + '"><div class="list-group col-sm-5" id="recipientList' + index + '"></div><div class="col-sm-7" id="recipientBody' + index + '"></div></div></div>');
        //iterate over all recipients and append to list
        $.each(value, function (indexRecipient, valueRecipient) {
           lpl.addRecipient(index, valueRecipient, lang);
        });
        $('.recipientMain' + index + ':first').removeClass('collapse');
        $('.recipientList' + index + ':first').addClass('active');
    },
    /**
     * Add recipient to list and toggle content
     * @param index - index of the purpose
     * @param valueRecipient - object of one recipient which should be added to the list
     * @param lang - active language
     */
    addRecipient : function(index, valueRecipient, lang) {
        $('#recipientList' + index).append('<a onclick="lpl.toggleContent(this, \'recipientMain' + index + '\', \'recipientMain' + index + valueRecipient.name + '\', \'recipientList' + index + '\')" class="list-group-item recipientList'+index+valueRecipient.name+' recipientList' + index + '">' + lpl.findTranslation(valueRecipient.headerList, lang) + '</a>');
        $('#recipientBody' + index).append('<div class="recipientMain' + index + ' collapse" id="recipientMain' + index + valueRecipient.name + '"><p>' + lpl.findTranslation(valueRecipient.descriptionList, lang) + '</p></div>')
    },
    /**
     * Creates an Panel to display the retention
     * @param index - index of the purpose
     * @param value - retention object from the LPLJson
     * @param lang - active language
     */
    addRetentionPanel : function (index, value, lang) {
        $('#main' + index).append('<div class="panel panel-default">' +
            '<div class="panel-heading retention-panel-heading-' + index + '"><a onclick="$(\'#retentionPanel' + index + '\').toggle(200)">' + lpl.translation.RETENTION[lang] + '</a></div>' +
            '<div class="panel-body collapse" id="retentionPanel' + index + '"></div></div>');
        //Check if retention exists in LPLJson
        if(value.headerList !== undefined && value.descriptionList !== undefined) {
            lpl.addRetention(index, value, lang);
        }
    },
    /**
     * Checks for different configurations and displays the retention
     * @param index - index of the purpose
     * @param value - retention object from LPLJson
     * @param lang - active language
     */
    addRetention : function(index, value, lang) {
        $('#retentionPanel'+index).html('<b>' + lpl.findTranslation(value.headerList, lang) + '</b><p>' + lpl.findTranslation(value.descriptionList, lang) + '</p>');
        //If retention is a fixed date, display date
        if(value.type == "FIXEDDATE" && value.pointInTime != undefined) {
            $('#retentionPanel' + index).append('<b>' + lpl.translation.FIXEDDATE[lang] + ': </b>' + value.pointInTime);
        }
        //If retention is a fixed duration, calculate the date for the duration
        if(value.type == "AFTERPURPOSE" && value.pointInTime != undefined) {
            var date = new Date();
            switch (value.pointInTime.type) {
                case 'day':
                    date.setTime( date.getTime() + parseInt(value.pointInTime.value) * 86400000 );
                    break;
                case 'month':
                    date.setMonth(date.getMonth() + parseInt(value.pointInTime.value));
                    break;
                case 'year':
                    date.setFullYear(date.getFullYear() + parseInt(value.pointInTime.value));
                    break;
            }
            var options = {year: 'numeric', month: '2-digit', day: '2-digit' };
            $('#retentionPanel'+index).append('<b>'+lpl.translation.FIXEDDATE[lang]+': </b>'+date.toLocaleDateString('de-DE', options));
        }
    },
    /**
     * Creates an Panel to display the privacy attributes
     * @param index - index of the purpose
     * @param value - privacy object from the LPLJson
     * @param lang - active language
     */
    addPrivacyPanel : function(index, value, lang) {
        $('#main' + index).append('<div class="panel panel-default">' +
            '<div class="panel-heading privacy-panel-heading-'+index+'"><a onclick="$(\'#privacyPanel' + index + '\').toggle(200)">' + lpl.translation.PRIVACY[lang] + '</a></div>' +
            '<div class="panel-body collapse row" id="privacyPanel' + index + '"><div class="list-group col-sm-5" id="privacyList' + index + '"></div><div class="col-sm-7" id="privacyBody' + index + '"></div></div></div>');
        if(value.length == 0) {
            $('#privacyBody'+index).html(lpl.translation.NOPRIVACY[lang]);
        }
        $.each(value, function (indexPrivacy, valuePrivacy) {
            lpl.addPrivacy(index, valuePrivacy, lang);
        });
    },
    /**
     * Displays privacy header and discription with the different privacy attributes
     * @param index - index of the purpose
     * @param valuePrivacy - privacy object from the LPLJson
     * @param lang - active language
     */
    addPrivacy : function(index, valuePrivacy, lang) {
        $('#privacyList' + index).append('<a onclick="lpl.toggleContent(this, \'privacyMain' + index + '\', \'privacyMain' + index + valuePrivacy.name+ '\', \'privacyList' + index + '\')" class="list-group-item privacyList'+index+valuePrivacy.name+' privacyList' + index + '">' + lpl.findTranslation(valuePrivacy.headerList, lang) + '</a>');
        $('#privacyBody' + index).append('<div class="privacyMain' + index + ' collapse" id="privacyMain' + index + valuePrivacy.name + '"><b>'+lpl.findTranslation(valuePrivacy.headerList, lang)+'</b><p>'+lpl.findTranslation(valuePrivacy.descriptionList, lang)+'</p></div>');
        $.each(valuePrivacy.attributeList.privacyModelAttribute, function (privacyIndex, privacyValue) {
            if (privacyValue.key == "K_ANONYMITY_K") {
                $('#privacyMain' + index + valuePrivacy.name).append('<p>' + lpl.translation.PRIVACY.PROBABILITY[lang] + '<b>' + (100 / privacyValue.value).toFixed(2) + '% </b></p>');
            }
            $('#privacyMain' + index + valuePrivacy.name).append('<br /><b>' + privacyValue.key + ': </b>' + privacyValue.value);
        });
        $('.privacyList' + index + ':first').addClass('active');
        $('.privacyMain' + index + ':first').removeClass('collapse');
    },
    /**
     * Opens panel according to clicked element and closes other
     * @param clicker - element which was clicked
     * @param hideClass - class of the elements the should be hided
     * @param id - id of the element that should be shown
     * @param list - list of links to remove the active class
     */
    toggleContent: function(clicker, hideClass, id, list) {
        $('.'+hideClass).hide(200);
        $('.'+list).removeClass('active');
        $(clicker).addClass('active');
        $('#'+id).show(200);
    },
    /**
     * LPL loaded, remove loading screen
     */
    finish: function () {
        if(lpl.triggerForm) {
            if(lpl.saveButton != undefined) {
                $('.'+lpl.saveButton).click(function (e) {
                    e.preventDefault();
                    $('.'+lpl.saveButton).closest("form").submit();
                });
            }
        }
        $('.loader').removeClass('loader');
        $('.load-item').removeClass('load-item');
    }
};

/*
 * Check if jQuery is available, otherwise load it by cdn
 * Start LPL
 * */
if(!window.jQuery)
{
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = "text/javascript";
    script.src = "https://code.jquery.com/jquery-2.2.4.js";
    script.onreadystatechange = handler;
    script.onload = handler;
    head.appendChild(script);
    function handler(){
        lpl.start();
    }

} else {
    lpl.ready = true;
}
