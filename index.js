// Generated by CoffeeScript 1.7.0
(function() {
  var Furnace, FurnaceDialog, Inventory, InventoryWindow, ItemPile, ModalDialog,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  ModalDialog = require('voxel-modal-dialog');

  Inventory = require('inventory');

  InventoryWindow = require('inventory-window');

  ItemPile = require('itempile');

  module.exports = function(game, opts) {
    return new Furnace(game, opts);
  };

  module.exports.pluginInfo = {
    loadAfter: ['voxel-registry', 'voxel-recipes', 'voxel-carry']
  };

  Furnace = (function() {
    function Furnace(game, opts) {
      var _ref, _ref1, _ref2;
      this.game = game;
      if (opts == null) {
        opts = {};
      }
      this.playerInventory = (function() {
        var _ref1, _ref2, _ref3;
        if ((_ref = (_ref1 = (_ref2 = game.plugins) != null ? (_ref3 = _ref2.get('voxel-carry')) != null ? _ref3.inventory : void 0 : void 0) != null ? _ref1 : opts.playerInventory) != null) {
          return _ref;
        } else {
          throw new Error('voxel-furnace requires "voxel-carry" plugin or "playerInventory" set to inventory instance');
        }
      })();
      this.registry = (function() {
        var _ref2;
        if ((_ref1 = (_ref2 = game.plugins) != null ? _ref2.get('voxel-registry') : void 0) != null) {
          return _ref1;
        } else {
          throw new Error('voxel-furnace requires "voxel-registry" plugin');
        }
      })();
      this.recipes = (function() {
        var _ref3;
        if ((_ref2 = (_ref3 = game.plugins) != null ? _ref3.get('voxel-recipes') : void 0) != null) {
          return _ref2;
        } else {
          throw new Error('voxel-furnace requires "voxel-recipes" plugin');
        }
      })();
      if (opts.registerBlock == null) {
        opts.registerBlock = true;
      }
      if (opts.registerRecipe == null) {
        opts.registerRecipe = true;
      }
      if (this.game.isClient) {
        this.furnaceDialog = new FurnaceDialog(game, this.playerInventory, this.registry, this.recipes);
      }
      this.opts = opts;
      this.enable();
    }

    Furnace.prototype.enable = function() {
      if (this.opts.registerBlock) {
        this.registry.registerBlock('furnace', {
          texture: ['crafting_table_top', 'planks_oak', 'crafting_table_side'],
          onInteract: (function(_this) {
            return function() {
              _this.furnaceDialog.open();
              return true;
            };
          })(this)
        });
      }
      if (this.opts.registerRecipe) {
        return this.recipes.registerAmorphous(['wood.plank', 'wood.plank', 'wood.plank', 'wood.plank'], new ItemPile('furnace', 1));
      }
    };

    Furnace.prototype.disable = function() {};

    return Furnace;

  })();

  FurnaceDialog = (function(_super) {
    __extends(FurnaceDialog, _super);

    function FurnaceDialog(game, playerInventory, registry, recipes) {
      var contents, crDiv, craftCont, resultCont;
      this.game = game;
      this.playerInventory = playerInventory;
      this.registry = registry;
      this.recipes = recipes;
      this.playerIW = new InventoryWindow({
        width: 10,
        registry: this.registry,
        inventory: this.playerInventory
      });
      this.craftInventory = new Inventory(3, 3);
      this.craftInventory.on('changed', (function(_this) {
        return function() {
          return _this.updateCraftingRecipe();
        };
      })(this));
      this.craftIW = new InventoryWindow({
        width: 3,
        registry: this.registry,
        inventory: this.craftInventory,
        linkedInventory: this.playerInventory
      });
      this.resultInventory = new Inventory(1);
      this.resultIW = new InventoryWindow({
        inventory: this.resultInventory,
        registry: this.registry,
        allowDrop: false,
        linkedInventory: this.playerInventory
      });
      this.resultIW.on('pickup', (function(_this) {
        return function() {
          return _this.tookCraftingOutput();
        };
      })(this));
      crDiv = document.createElement('div');
      crDiv.style.marginLeft = '30%';
      crDiv.style.marginBottom = '10px';
      craftCont = this.craftIW.createContainer();
      resultCont = this.resultIW.createContainer();
      resultCont.style.marginLeft = '30px';
      resultCont.style.marginTop = '15%';
      crDiv.appendChild(craftCont);
      crDiv.appendChild(resultCont);
      contents = [];
      contents.push(crDiv);
      contents.push(document.createElement('br'));
      contents.push(this.playerIW.createContainer());
      FurnaceDialog.__super__.constructor.call(this, game, {
        contents: contents
      });
    }

    FurnaceDialog.prototype.updateCraftingRecipe = function() {
      var recipe;
      recipe = this.recipes.find(this.craftInventory);
      console.log('found recipe', recipe);
      return this.resultInventory.set(0, recipe != null ? recipe.computeOutput(this.craftInventory) : void 0);
    };

    FurnaceDialog.prototype.tookCraftingOutput = function() {
      var recipe;
      recipe = this.recipes.find(this.craftInventory);
      if (recipe == null) {
        return;
      }
      recipe.craft(this.craftInventory);
      return this.craftInventory.changed();
    };

    FurnaceDialog.prototype.close = function() {
      var excess, i, _i, _ref;
      for (i = _i = 0, _ref = this.craftInventory.size(); 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (this.craftInventory.get(i)) {
          excess = this.playerInventory.give(this.craftInventory.get(i));
        }
        this.craftInventory.set(i, void 0);
      }
      return FurnaceDialog.__super__.close.call(this);
    };

    return FurnaceDialog;

  })(ModalDialog);

}).call(this);
