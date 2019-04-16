L.Control.Label = L.Control.extend({
    onAdd: function () {
        const container = L.DomUtil.create('div', 'leaflet-range-control leaflet-bar ');

        L.DomUtil.create('label', '', container).innerText = 're-call:';
        this._checkbox = L.DomUtil.create('input', '', container);
        this._checkbox.type = 'checkbox';
        L.DomUtil.create('br', '', container);
        this._label = L.DomUtil.create('label', '', container);

        const percentsContainer = L.DomUtil.create('div', 'leaflet-percentage-container', container);
        [0, 2, 4, 6, 8, 10].map(value => {
            const item = L.DomUtil.create('div', '', percentsContainer);
            item.innerText = `+${value}%`;
            item.style = `background: rgba(125,125,125,${0.6 * (value / 10)})`;
        })

        L.DomEvent.on(this._checkbox, 'change', (e) => {
            this.fire('change', { value: e.target.checked });
        });

        return container;
    },

    setText: function (text) {
        this._label.innerText = text;
    }
});

L.Control.Label.include(L.Evented.prototype)

L.control.label = function (opts) {
    return new L.Control.Label(opts);
}