(function() {
  var Bug, Food;

  Bug = (function() {
    function Bug(x, y) {
      this.x = x;
      this.y = y;
      this.vx = 0;
      this.vy = 0;
      this.radius = 1;
      this.spurt = 0.5;
      this.color = '#fff';
      this.hasTarget = false;
      this;
    }

    Bug.prototype.update = function(ctx, index, ndt) {
      var closestTarget, dist, dx, dy, food, i, lowestDist, target;
      this.hasTarget = false;
      if (ctx.food.length) {
        lowestDist = 999999;
        closestTarget = null;
        i = ctx.food.length;
        while (i--) {
          food = ctx.food[i];
          dx = this.x - food.x;
          dy = this.y - food.y;
          dist = sqrt(dx * dx + dy * dy);
          if (dist < lowestDist) {
            lowestDist = dist;
            closestTarget = i;
          }
        }
        target = ctx.food[closestTarget];
        dx = this.x - target.x;
        dy = this.y - target.y;
        dist = sqrt(dx * dx + dy * dy);
        if (dist < target.threshold + target.radius && target.active) {
          this.hasTarget = true;
          if (dist < target.radius * (target.life / target.radius) + 5) {
            target.life -= 0.004;
          }
        }
      }
      if (this.hasTarget) {
        this.vx += (random(-0.2, 0.2)) * this.spurt;
        this.vy += (random(-0.2, 0.2)) * this.spurt;
        this.vx -= dx / 500;
        this.vy -= dy / 500;
      } else {
        this.vx += (random(-0.2, 1)) * this.spurt;
        this.vy += (random(-0.2, 0.2)) * this.spurt;
      }
      this.x += this.vx * ndt;
      this.y += this.vy * ndt;
      this.vx *= 0.95;
      this.vy *= 0.95;
      if (this.spurt > 0.5) {
        this.spurt -= 0.1;
      }
      if (this.spurt <= 0.5 && !floor(random(1000))) {
        return this.spurt = random(1, 4);
      }
    };

    Bug.prototype.wrap = function(ctx) {
      if (!this.hasTarget) {
        if (this.x > ctx.width + this.radius) {
          this.x = -this.radius;
        } else if (this.x < -this.radius) {
          this.x = ctx.width + this.radius;
        }
        if (this.y > ctx.height + this.radius) {
          return this.y = -this.radius;
        } else if (this.y < -this.radius) {
          return this.y = ctx.height + this.radius;
        }
      }
    };

    return Bug;

  })();

  Food = (function() {
    function Food(x, y) {
      this.x = x;
      this.y = y;
      this.growthRadius = 0.0001;
      this.radius = random(20, 50);
      this.life = this.radius;
      this.threshold = 50;
      this.active = false;
      this;
    }

    Food.prototype.update = function(ctx, index, ndt) {
      if (!this.active) {
        this.growthRadius += 1;
        if (this.growthRadius >= this.radius) {
          this.active = true;
        }
      }
      if (this.life <= 0) {
        return ctx.food.splice(index, 1);
      }
    };

    return Food;

  })();

  Sketch.create({
    setup: function() {
      var i;
      this.tick = 0;
      this.mouse.x = this.width / 2;
      this.mouse.y = this.height / 2;
      this.food = (function() {
        var j, results;
        results = [];
        for (i = j = 0; j <= 0; i = ++j) {
          results.push(new Food(random(this.width), random(this.height)));
        }
        return results;
      }).call(this);
      return this.bugs = (function() {
        var j, results;
        results = [];
        for (i = j = 0; j <= 2000; i = ++j) {
          results.push(new Bug(0, random(this.height)));
        }
        return results;
      }).call(this);
    },
    mousedown: function() {
      return this.food.push(new Food(this.mouse.x, this.mouse.y));
    },
    update: function() {
      var i, results;
      this.ndt = max(0.001, this.dt / (1000 / 60));
      this.tick++;
      if (this.tick % 50 === 0) {
        this.food.push(new Food(random(this.width), random(this.height)));
      }
      i = this.food.length;
      while (i--) {
        this.food[i].update(this, i, this.ndt);
      }
      i = this.bugs.length;
      results = [];
      while (i--) {
        this.bugs[i].wrap(this);
        results.push(this.bugs[i].update(this, i, this.ndt));
      }
      return results;
    },
    draw: function() {
      var bug, food, i;
      this.fillStyle = '#d33';
      i = this.food.length;
      while (i--) {
        this.beginPath();
        food = this.food[i];
        if (food.active) {
          this.arc(food.x, food.y, max(0.0001, food.radius * (food.life / food.radius)), 0, TWO_PI);
        } else {
          this.arc(food.x, food.y, food.growthRadius, 0, TWO_PI);
        }
        this.fill();
      }
      this.beginPath();
      this.fillStyle = '#fff';
      i = this.bugs.length;
      while (i--) {
        bug = this.bugs[i];
        this.rect(~~bug.x, ~~bug.y, 1, 1);
      }
      this.fill();
      this.beginPath();
      this.arc(this.mouse.x, this.mouse.y, 10 - cos(this.millis / 100) * 2, 0, TWO_PI);
      this.strokeStyle = '#d33';
      return this.stroke();
    }
  });

}).call(this);