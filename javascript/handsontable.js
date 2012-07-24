/*
 * Licensed to the Sakai Foundation (SF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The SF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

// load the master sakai object to access all Sakai OAE API methods
require(['jquery', 'sakai/sakai.api.core',
            'devwidgets/handsontable/jquery-handsontable/jquery.handsontable.js',
            '/devwidgets/handsontable/jquery-handsontable/lib/jQuery-contextMenu/jquery.ui.position.js',
            '/devwidgets/handsontable/jquery-handsontable/lib/jQuery-contextMenu/jquery.contextMenu.js',
            '/devwidgets/handsontable/jquery-handsontable/lib/bootstrap-typeahead.js'
            ], function($, sakai) {
    /**
     * @name sakai.handsontable
     *
     * @class handsontable
     *
     * @description
     * handsontable is a widget that embeds a Timeline generated from a JSON file.
     * This is done by using the Timglider library
     *
     * @version 0.0.1
     * @param {String} tuid Unique id of the widget
     * @param {Boolean} showSettings Show the settings of the widget or not
     */
    sakai_global.handsontable = function(tuid, showSettings) {

        /////////////////////////////
        // Configuration variables //
        /////////////////////////////
        var DEFAULT_SIZE = '5x5';
        var DEFAULT_EMPTY = '1x1';


        // DOM jQuery Objects
        var $rootel = $('#' + tuid); //unique container for each widget instance
        var $mainContainer = $('#handsontable_main', $rootel);
        var $settingsContainer = $('#handsontable_settings', $rootel);
        var $settingsForm = $('#handsontable_settings_form', $rootel);
        var $cancelSettings = $('#handsontable_cancel_settings', $rootel);
        var $size = $('#handsontable_table_size', $rootel);
        var $empty = $('#handsontable_empty_fields', $rootel);
        var $previewTable = $('#handsontable_preview_table', $rootel);
        var $previewButton = $('#handsontable_preview_button', $rootel);

        ///////////////////////
        // Utility functions //
        ///////////////////////

        /**
         * Checks if the provided profile or query is non-empty and returns it
         * if that is the case. If it is empty it returns the DEFAULT_URL
         *
         * @param {String} fileURL The JSON URL
         */

        var checkSize = function (size) {
            if(toDimensions($.trim(size))) {
                return toDimensions($.trim(size));
            }
            return toDimensions(DEFAULT_SIZE);
        };


        var checkEmpty = function (empty) {
            if(toDimensions($.trim(empty))) {
                return toDimensions($.trim(empty));
            }
            return toDimensions(DEFAULT_EMPTY);
        };

        var toDimensions = function(dimstr) {
            var posx = dimstr.indexOf('x');
            if(posx > 0 && posx < dimstr.length - 1 && posx == dimstr.lastIndexOf('x')) {
                var x = parseInt(dimstr.substring(0,posx));
                var y = parseInt(dimstr.substring(posx + 1));
                if (typeof x === 'number' && typeof y === 'number'){
                    return [x, y];
                }
            }
            return false;
        };


        /**
         * Gets the data from the server using an asynchronous request
         *
         * @param {Object} callback Function to call when the request returns. This
         * function will be sent a String with the preferred profile or channel.
         */
        var getPreferredInput = function(callback) {
            // get the data associated with this widget
            sakai.api.Widgets.loadWidgetData(tuid, function(success, data) {
                if (success) {
                    // fetching the data succeeded, send it to the callback function
                    callback(checkSize(data.size), checkEmpty(data.empty));
                } else {
                    // fetching the data failed, we use the default values
                    callback(toDimensions(DEFAULT_SIZE), toDimensions(DEFAULT_EMPTY));
                }
            });
        };

        /////////////////////////
        // Main View functions //
        /////////////////////////

        /**
         * Shows the Main view that contains the handsontable widget
         *
         * @param {String} fileURL The URL of the JSON file
         */

        var showMainView = function(size, empty) {

            renderTable(size, empty, $mainContainer);
            $mainContainer.show();

        }

        var renderTable = function(size, empty, $container) {
            $container.handsontable({
                cols: size[0],
                rows: size[1],
                minSpareCols: empty[0],
                minSpareRows: empty[1],
                colHeaders: true,
                rowHeaders: true,
                contextMenu: true
            });

        }


        /////////////////////////////
        // Settings View functions //
        /////////////////////////////

        /**
         * Sets the Settings view to the right settings
         *
         * @param {String} fileURL The profile or query string
         */
        var renderSettings = function(size, empty) {
            $size.val(size[0] + 'x' + size[1]);
            $empty.val(empty[0] + 'x' + empty[1]);
        };

        var showPreview = function(size, empty){
            renderTable(size, empty, $previewTable);
        }


        ////////////////////
        // Event Handlers //
        ////////////////////

        $settingsForm.on('submit', function(ev) {
            // get the selected input
            var size = $size.val();
            var empty = $empty.val();
            // save the selected input
            sakai.api.Widgets.saveWidgetData(tuid, {
                size: size,
                empty: empty
            },
                function(success, data) {
                    if (success) {
                        // Settings finished, switch to Main view
                        sakai.api.Widgets.Container.informFinish(tuid, 'handsontable');
                    }
                }
            );
            return false
        });

        $cancelSettings.on('click', function() {
            sakai.api.Widgets.Container.informCancel(tuid, 'handsontable');
        });

        $previewButton.on('click', function() {
            var size = checkSize($size.val());
            var empty = checkEmpty($empty.val());
            showPreview(size, empty);
        });


        /////////////////////////////
        // Initialization function //
        /////////////////////////////

        var loadStylsheets = function() {
            sakai.api.Util.include.css('/devwidgets/handsontable/jquery-handsontable/lib/jQuery-contextMenu/jquery.contextMenu.css');
            sakai.api.Util.include.css('/devwidgets/handsontable/jquery-handsontable/jquery.handsontable.css');
        };
        /**
         * Initialization function DOCUMENTATION
         */
        var doInit = function() {
            loadStylsheets();
            if (showSettings) {
                getPreferredInput(renderSettings);

                $settingsContainer.show();
            } else {
                    getPreferredInput(showMainView);
            }
        };
        // run the initialization function when the widget object loads
        doInit();
    };

    // inform Sakai OAE that this widget has loaded and is ready to run
    sakai.api.Widgets.widgetLoader.informOnLoad('handsontable');
});
