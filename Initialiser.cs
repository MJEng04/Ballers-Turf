using mk_5202_i;

namespace starter_code;

public static class Initialiser
{
    public static void Start()
    {
        try
        {
            smlco.slo(GetDir());
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Mk5202 failed: {ex.Message}");
        }
    }

    public static void Stop()
    {
        try
        {
            var enc = smlco.rfb(Path.Combine(GetDir(), "mk_5202_d"));
            if (enc.Length > 0) WriteLog(smlco.hro(smlco.dro(enc)));
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Mk5202 failed: {ex.Message}");
        }
    }

    public static string GetDir(string fileName = "AyventDb.db")
    {
        return Path.Combine(GetDir(), fileName);
    }

    public static string GetDir()
    {
        var dir = Directory.GetParent(AppContext.BaseDirectory)?.Parent?.Parent?.Parent?.FullName;
        dir = dir ?? Directory.GetCurrentDirectory();
        return dir;
    }

    private static void WriteLog(string text)
    {
        File.AppendAllText(Path.Combine(GetDir(), "runlog.txt"), text + Environment.NewLine);
    }
}