var InstafeedWrapper = (function(){
    'use strict';

    /**
     *
     * @param
     * @returns
     */
    var _instances = {};

    /**
     *
     * @param
     * @returns
     */
    var _userSecureOptions = {};

    /**
     * The InstafeedWrapper constructor.
     *
     * @param {HTMLElement} container
     * @param {Object} options
     * @constructor
     */
    function InstafeedWrapper(container, options) {
        this.container = container;
        this.ID = this.container.getAttribute('id');

        this.instance = _instances[this.ID] = new Instafeed(this._overrideOptions(options));
        this.instance.run();
        this._initLoadMoreControl();
    };

    /**
     *
     * @param {Object} options
     * @return {Object}
     */
    InstafeedWrapper.prototype._overrideOptions = function (options) {
        var dataStringMap = this.container.dataset;
        options.target = this.ID;

        for(var property in dataStringMap) {
            if(property == 'user') {
                if(dataStringMap[property] in _userSecureOptions) {
                    for(var userOption in _userSecureOptions[dataStringMap[property]]) {
                        options[userOption] = _userSecureOptions[dataStringMap[property]][userOption];
                    }
                }
                else {
                    throw new Error('The secure options for user ' +dataStringMap[property]+ ' isn\'t set.');
                }

                continue;
            }

            if(property in options) {
                options[property] = dataStringMap[property];
            }
        }

        return options;
    };

    /**
     *
     * @param
     * @returns
     */
    InstafeedWrapper.prototype._initLoadMoreControl = function () {
        var loadMoreControlId = this.container.dataset.loadMoreControl,
            loadMoreControl,
            self = this;

        if(!loadMoreControlId) return;

        loadMoreControl = document.getElementById(loadMoreControlId);

        if(!loadMoreControl) return;

        loadMoreControl.addEventListener('click', function(event){
            self.instance.next();

            event.preventDefault();
        }, false);
    };

    return {
        /**
         *
         * @param {HTMLCollection} containers
         * @param {Object} options
         */
        init: function(containers, options) {
            options = options || {};

            Array.prototype.forEach.call(containers, function(container, index, array) {
                if(container.getAttribute('id') in _instances) {
                    throw new Error('One of the specified containers duplicates an existing ID.');
                }

                if(!container.hasAttribute('id')) {
                    throw new Error('One of the specified containers doesn\'t have a unique ID.');
                }

                new InstafeedWrapper(container, options);
            });
        },

        /**
         * Sets up users OAuth secure data.
         *
         * @param {Object} users
         */
        setUsersSecureOptions: function(users) {
            for(var user in users) {
                if(user in _userSecureOptions) {
                    throw new Error('The secure options for user ' +user+ ' is already set.');
                }

                if(!('userId' in users[user]) || !('accessToken' in users[user]) || !('clientId' in users[user])) {
                    throw new Error('You must specify "userId", "accessToken" and "clientId" option for each user.');
                }

                _userSecureOptions[user] = users[user];
            }
        }
    };
})();
