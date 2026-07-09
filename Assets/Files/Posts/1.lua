[[--Code Made By TotallyNotPipes--]]

local Loot_BHFEGHEEFI_Orig = Loot.BHFEGHEEFI
Loot.BHFEGHEEFI = function(a1) --gets called when wpns menu gets opened, useful if you don't have lua inj that can replace parts of files
        LOOT.IsItemIDEquippableByGame = function(a1,a2,a3)
        return true
    end

    PROGRESSION.GetWeaponLevel = function( a1, weapon)
        local maxlvl = PROGRESSION.GetMaxWeaponLevel( weapon)
        return maxlvl
    end

    return Loot_BHFEGHEEFI_Orig(a1)
end